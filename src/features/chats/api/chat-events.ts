import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import type { LiveEventsSubscriber } from '@/shared/api'
import { patchOrRefetch } from '@/shared/lib'

import type { ChatEvent, ChatPage, MessagePage } from '../model/chat'
import { moveChatToTop, upsertMessage } from './chat-cache'
import { chatKeys } from './chat-queries'

type MessageEventKind = 'message.created' | 'message.updated'

// One pushed message, live or replayed after a reconnection
export function applyMessage(queryClient: QueryClient, kind: MessageEventKind, { chat_id, message }: ChatEvent) {
  patchOrRefetch<InfiniteData<MessagePage>>(queryClient, chatKeys.messages(chat_id), (data) =>
    upsertMessage(data, message),
  )
  if (kind !== 'message.created') return

  const chats = moveChatToTop(queryClient.getQueryData<InfiniteData<ChatPage>>(chatKeys.list()), chat_id)
  if (chats) patchOrRefetch<InfiniteData<ChatPage>>(queryClient, chatKeys.list(), () => chats)
  else void queryClient.invalidateQueries({ queryKey: chatKeys.list() }) // a new chat: refetch the list
}

// The chats' part of the live events stream. No onReconnect: the browser resends Last-Event-ID
// by itself and the server replays the messages that changed meanwhile
export function chatLiveEvents(queryClient: QueryClient): LiveEventsSubscriber {
  return {
    events: {
      'message.created': (data) => applyMessage(queryClient, 'message.created', data as ChatEvent),
      'message.updated': (data) => applyMessage(queryClient, 'message.updated', data as ChatEvent),
      // Rare: more was missed than the server replays (200 changes): refetch what's on screen
      resync: () => {
        void queryClient.invalidateQueries({ queryKey: chatKeys.list() })
        void queryClient.invalidateQueries({ queryKey: chatKeys.allMessages() })
      },
    },
  }
}
