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
