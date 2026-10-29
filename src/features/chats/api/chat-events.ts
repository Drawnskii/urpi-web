import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import type { LiveEventsSubscriber } from '@/shared/api'
import { patchOrRefetch } from '@/shared/lib'

import type { ChatEvent, ChatPage, ChatReadEvent, MessagePage } from '../model/chat'
import { applyMessageToChats, setUnreadCount, upsertMessage } from './chat-cache'
import { chatKeys } from './chat-queries'

type MessageEventKind = 'message.created' | 'message.updated'

// One pushed message, live or replayed after a reconnection
export function applyMessage(queryClient: QueryClient, kind: MessageEventKind, { chat_id, message }: ChatEvent) {
  patchOrRefetch<InfiniteData<MessagePage>>(queryClient, chatKeys.messages(chat_id), (data) =>
    upsertMessage(data, message),
  )

  // The list's last message, time and unread count
  const list = queryClient.getQueryData<InfiniteData<ChatPage>>(chatKeys.list())
  if (!list) return // not loaded: it loads fresh when opened
  const chats = applyMessageToChats(list, chat_id, message)
  if (chats) patchOrRefetch<InfiniteData<ChatPage>>(queryClient, chatKeys.list(), () => chats)
  else if (kind === 'message.created') void queryClient.invalidateQueries({ queryKey: chatKeys.list() }) // a new chat
}

// The chats' part of the live events stream. No onReconnect: the browser resends Last-Event-ID
// by itself and the server replays the messages that changed meanwhile
export function chatLiveEvents(queryClient: QueryClient): LiveEventsSubscriber {
  return {
    events: {
      'message.created': (data) => applyMessage(queryClient, 'message.created', data as ChatEvent),
      'message.updated': (data) => applyMessage(queryClient, 'message.updated', data as ChatEvent),
      // A member read the chat (any member, any tab): the server's count, 0 unless more came since
      'chat.read': (data) => {
        const { chat_id, unread_count } = data as ChatReadEvent
        patchOrRefetch<InfiniteData<ChatPage>>(queryClient, chatKeys.list(), (chats) =>
          setUnreadCount(chats, chat_id, unread_count),
        )
      },
      // Rare: more was missed than the server replays (200 changes): refetch what's on screen
      resync: () => {
        void queryClient.invalidateQueries({ queryKey: chatKeys.list() })
        void queryClient.invalidateQueries({ queryKey: chatKeys.allMessages() })
      },
    },
  }
}
