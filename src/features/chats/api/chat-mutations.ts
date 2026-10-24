import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'

import type { AddMessageInput, Message, MessagePage } from '../model/chat'
import { chatApi } from './chat-api'
import { removeMessage, upsertMessage } from './chat-cache'
import { chatKeys } from './chat-queries'

// Three things arrive in any order: the optimistic message, the POST's 201 and message.created
// from the stream. upsertMessage replaces by id, so they converge to one message
export function useAddMessage(chatId: string) {
  const queryClient = useQueryClient()
  const queryKey = chatKeys.messages(chatId)

  return useMutation({
    mutationFn: (input: AddMessageInput) => chatApi.addMessage(chatId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey })
      const optimistic: Message = {
        id: `temp-${crypto.randomUUID()}`,
        sender_type: 'TENANT_MEMBER',
        content: input.content,
        status: 'PENDING',
        failure_reason: null,
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
    onError: (_error, _input, onMutateResult) => {
      if (!onMutateResult) return
      queryClient.setQueryData<InfiniteData<MessagePage>>(queryKey, (data) => removeMessage(data, onMutateResult.tempId))
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
