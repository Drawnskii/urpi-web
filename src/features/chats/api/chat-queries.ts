import { infiniteQueryOptions, queryOptions, useSuspenseInfiniteQuery } from '@tanstack/react-query'

import { chatApi } from './chat-api'

// chat-events.ts patches the cache by these keys: change both together
export const chatKeys = {
  all: ['chats'] as const,
  list: () => [...chatKeys.all, 'list'] as const,
  detail: (chatId: string) => [...chatKeys.all, 'detail', chatId] as const,
  allClientChats: () => [...chatKeys.all, 'client'] as const,
  clientChats: (clientId: string) => [...chatKeys.allClientChats(), clientId] as const,
  allMessages: () => [...chatKeys.all, 'messages'] as const,
  messages: (chatId: string) => [...chatKeys.allMessages(), chatId] as const,
}

type ChatCursor = { id: string; updatedAt: string }
type MessageCursor = { id: string; createdAt: string }

// The backend's MAX_CHAT_PAGE_SIZE: one page holds a client's chats, past ones included
const CLIENT_CHATS_LIMIT = 100

export const chatQueries = {
  // The inbox: one row per client, its newest chat (closed ones are reached from the chat)
  list: () =>
    infiniteQueryOptions({
      queryKey: chatKeys.list(),
      queryFn: ({ pageParam }) =>
        chatApi.list({
          latest_per_client: true,
          ...(pageParam && { after_id: pageParam.id, after_updated_at: pageParam.updatedAt }),
        }),
      initialPageParam: undefined as ChatCursor | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.next_after_id && lastPage.next_after_updated_at
          ? { id: lastPage.next_after_id, updatedAt: lastPage.next_after_updated_at }
          : undefined,
    }),
  detail: (chatId: string) =>
    queryOptions({
      queryKey: chatKeys.detail(chatId),
      queryFn: () => chatApi.get(chatId),
    }),
  // A client's chats, newest first: its current one and the closed ones before it
  clientChats: (clientId: string) =>
    queryOptions({
      queryKey: chatKeys.clientChats(clientId),
      queryFn: () => chatApi.list({ client_id: clientId, limit: CLIENT_CHATS_LIMIT }),
      select: (page) => page.chats,
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
