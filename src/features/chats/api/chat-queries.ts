import { infiniteQueryOptions, useSuspenseInfiniteQuery } from '@tanstack/react-query'

import { chatApi } from './chat-api'

// chat-events.ts patches the cache by these keys: change both together
export const chatKeys = {
  all: ['chats'] as const,
  list: () => [...chatKeys.all, 'list'] as const,
  allMessages: () => [...chatKeys.all, 'messages'] as const,
  messages: (chatId: string) => [...chatKeys.allMessages(), chatId] as const,
}

type ChatCursor = { id: string; updatedAt: string }
type MessageCursor = { id: string; createdAt: string }

export const chatQueries = {
  list: () =>
    infiniteQueryOptions({
      queryKey: chatKeys.list(),
      queryFn: ({ pageParam }) =>
        chatApi.list(pageParam ? { after_id: pageParam.id, after_updated_at: pageParam.updatedAt } : undefined),
      initialPageParam: undefined as ChatCursor | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.next_after_id && lastPage.next_after_updated_at
          ? { id: lastPage.next_after_id, updatedAt: lastPage.next_after_updated_at }
          : undefined,
    }),
  messages: (chatId: string) =>
    infiniteQueryOptions({
      queryKey: chatKeys.messages(chatId),
      queryFn: ({ pageParam }) =>
        chatApi.listMessages(
          chatId,
          pageParam ? { before_id: pageParam.id, before_created_at: pageParam.createdAt } : undefined,
        ),
      initialPageParam: undefined as MessageCursor | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.next_before_id && lastPage.next_before_created_at
          ? { id: lastPage.next_before_id, createdAt: lastPage.next_before_created_at }
          : undefined,
    }),
}

// The newest client message in the cache. Reads the same cache entry as the message list
// (no request); select re-renders only when this id changes
export function useLatestClientMessageId(chatId: string) {
  return useSuspenseInfiniteQuery({
    ...chatQueries.messages(chatId),
    select: (data) =>
      data.pages.flatMap((page) => page.messages).find((message) => message.sender_type === 'CLIENT')?.id,
  }).data
}
