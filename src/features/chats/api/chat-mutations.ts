import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'

import { useCurrentTenant } from '@/features/tenants'
import { whatsAppConnectionQueries } from '@/features/whatsapp-connection'
import { isApiError } from '@/shared/api'

import type {
  AddMessageInput,
  Chat,
  ChatPage,
  Message,
  MessagePage,
  RenameChatInput,
  SendTemplateInput,
} from '../model/chat'
import { chatApi } from './chat-api'
import { removeMessage, replaceChat, setChatTitle, upsertMessage } from './chat-cache'
import { chatKeys } from './chat-queries'

// The backend's refusal of free text outside the client's service window
const WINDOW_CLOSED_ERROR = 'ServiceWindowClosedError'
// Its refusal of a template while the business can't send any
const TEMPLATES_DISABLED_ERROR = 'TemplatesDisabledError'

// Three things arrive in any order: the optimistic message, the POST's 201 and message.created
// from the stream. upsertMessage replaces by id, so they converge to one message
export function useAddMessage(chatId: string) {
  const queryClient = useQueryClient()
  const queryKey = chatKeys.messages(chatId)
  // The optimistic message's author: the signed-in member, so it carries no name, like the saved one
  const memberId = useCurrentTenant()?.member_id ?? null

  return useMutation({
    mutationFn: (input: AddMessageInput) => chatApi.addMessage(chatId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey })
      const optimistic: Message = {
        id: `temp-${crypto.randomUUID()}`,
        sender_type: 'TENANT_MEMBER',
        sender_tenant_member_id: memberId,
        content: input.content,
        type: 'TEXT',
        payload: {},
        status: 'PENDING',
        failure_reason: null,
        failure_code: null,
        created_at: new Date().toISOString(),
      }
      queryClient.setQueryData<InfiniteData<MessagePage>>(queryKey, (data) => upsertMessage(data, optimistic))
      return { tempId: optimistic.id }
    },
    // Swap the optimistic message for the saved one; if the stream already added it, upsert replaces it
    onSuccess: (saved, _input, onMutateResult) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(queryKey, (data) =>
        upsertMessage(onMutateResult ? removeMessage(data, onMutateResult.tempId) : data, saved),
      )
    },
    onError: (error, _input, onMutateResult) => {
      // The window closed while they wrote: the chat's new expiry turns the composer into its notice.
      // Not awaited, so the composer gets its text back first
      if (isApiError(error) && error.code === WINDOW_CLOSED_ERROR) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) })
      }
      if (!onMutateResult) return
      queryClient.setQueryData<InfiniteData<MessagePage>>(queryKey, (data) => removeMessage(data, onMutateResult.tempId))
    },
  })
}

// Not optimistic: only the server knows the template is still approved and renders its text. The
// saved message joins the list; message.created from the stream replaces it by id
export function useSendTemplate(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SendTemplateInput) => chatApi.sendTemplate(chatId, input),
    onSuccess: (saved) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(chatKeys.messages(chatId), (data) => upsertMessage(data, saved))
    },
    // Turned off since the picker read the number: read it again, and the picker says why
    onError: (error) => {
      if (isApiError(error) && error.code === TEMPLATES_DISABLED_ERROR) {
        return queryClient.invalidateQueries({ queryKey: whatsAppConnectionQueries.detail().queryKey })
      }
    },
  })
}

// Not optimistic: only the server knows it may still be sent. The queued message replaces the failed
// one, and the stream follows it from there
export function useRetryMessage(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => chatApi.retryMessage(chatId, messageId),
    onSuccess: (queued) => {
      queryClient.setQueryData<InfiniteData<MessagePage>>(chatKeys.messages(chatId), (data) => upsertMessage(data, queued))
    },
    // The chat or the message changed since it was shown (closed, window over, already queued):
    // read both again, so the bubble offers what can still be done
    onError: (error) => {
      if (!isApiError(error) || !error.isConflict) return
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) }),
        queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId) }),
      ])
    },
  })
}

// The newest client message each chat is marked read up to, so each one is marked once.
// Both routes mark read. Module scope: it survives switching chats
const markedReadUpTo = new Map<string, string>()

export function isMarkedRead(chatId: string, clientMessageId: string) {
  return markedReadUpTo.get(chatId) === clientMessageId
}

// The variable is the newest client message the call covers (the route itself takes only the chat)
function useReadReceiptMutation(chatId: string, send: (chatId: string) => Promise<void>) {
  return useMutation({
    mutationFn: (_clientMessageId: string) => send(chatId),
    // Claimed before the call, so a re-render can't send it twice; given back if the call fails
    onMutate: (clientMessageId) => {
      const previous = markedReadUpTo.get(chatId)
      markedReadUpTo.set(chatId, clientMessageId)
      return { previous }
    },
    onError: (_error, clientMessageId, onMutateResult) => {
      if (markedReadUpTo.get(chatId) !== clientMessageId) return
      if (onMutateResult?.previous) markedReadUpTo.set(chatId, onMutateResult.previous)
      else markedReadUpTo.delete(chatId)
    },
  })
}

// WhatsApp's blue ticks. A 502 (the provider failed) is left alone: the next client message retries
export function useMarkChatRead(chatId: string) {
  return useReadReceiptMutation(chatId, chatApi.markRead)
}

// "typing…" for about 25 s, and the blue ticks
export function useShowTyping(chatId: string) {
  return useReadReceiptMutation(chatId, chatApi.showTyping)
}

// Optimistic (the guide's exception): the field turns back into the label at once, and waiting for
// the server would show the old name meanwhile. The saved name replaces it; a failure restores the old one
export function useRenameChat(chatId: string) {
  const queryClient = useQueryClient()
  const queryKey = chatKeys.list()

  return useMutation({
    mutationFn: (input: RenameChatInput) => chatApi.rename(chatId, input),
    onMutate: async ({ title }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<InfiniteData<ChatPage>>(queryKey)
      queryClient.setQueryData<InfiniteData<ChatPage>>(queryKey, (data) => setChatTitle(data, chatId, title))
      return { previous }
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<InfiniteData<ChatPage>>(queryKey, (data) => setChatTitle(data, chatId, saved.title))
    },
    onError: (_error, _input, onMutateResult) => {
      if (onMutateResult?.previous) queryClient.setQueryData(queryKey, onMutateResult.previous)
    },
  })
}

// Not optimistic: closing can't be undone, so the chat shows closed only once the server says so.
// The inbox row stays (the client's newest chat, now closed) until the client writes again
export function useCloseChat(chatId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => chatApi.close(chatId),
    onSuccess: (closed) => {
      queryClient.setQueryData<Chat>(chatKeys.detail(chatId), closed)
      queryClient.setQueryData<InfiniteData<ChatPage>>(chatKeys.list(), (data) => replaceChat(data, closed))
      void queryClient.invalidateQueries({ queryKey: chatKeys.clientChats(closed.client_id) })
    },
  })
}
