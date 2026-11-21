import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import { tenantQueries, type TenantMember } from '@/features/tenants'
import type { LiveEventsSubscriber } from '@/shared/api'
import { patchOrRefetch } from '@/shared/lib'

import type { ChatEvent, ChatPage, ChatReadEvent, ChatTypingEvent, Message, MessagePage } from '../model/chat'
import { setTyping, stopTyping } from '../model/typing-store'
import { applyMessageToChats, chatHasClientName, setUnreadCount, upsertMessage } from './chat-cache'
import { chatKeys } from './chat-queries'

type MessageEventKind = 'message.created' | 'message.updated'

// One pushed message, live or replayed after a reconnection
function applyMessage(queryClient: QueryClient, kind: MessageEventKind, { chat_id, message }: ChatEvent) {
  const isNew = kind === 'message.created'
  if (isNew) applyNewReply(queryClient, chat_id, message)
  patchOrRefetch<InfiniteData<MessagePage>>(queryClient, chatKeys.messages(chat_id), (data) =>
    upsertMessage(data, message),
  )

  // The list's last message, time and unread count
  const list = queryClient.getQueryData<InfiniteData<ChatPage>>(chatKeys.list())
  if (!list) return // not loaded: it loads fresh when opened
  const chats = applyMessageToChats(list, chat_id, message)
  if (!chats) {
    if (isNew) {
      // A new chat: maybe a client's next one after a closed chat, which replaces its inbox row and
      // becomes the current chat in its picker
      void queryClient.invalidateQueries({ queryKey: chatKeys.list() })
      void queryClient.invalidateQueries({ queryKey: chatKeys.allClientChats() })
    }
    return
  }
  patchOrRefetch<InfiniteData<ChatPage>>(queryClient, chatKeys.list(), () => chats)
  // The client's first message since their name was known: fetch it (the event carries no name)
  if (isNew && message.sender_type === 'CLIENT' && !chatHasClientName(list, chat_id)) {
    void queryClient.invalidateQueries({ queryKey: chatKeys.list() })
  }
}

// A reply ends its writer's typing indicator. A teammate the team list doesn't have yet (they just
// joined): refetch it, so their name shows
function applyNewReply(queryClient: QueryClient, chatId: string, message: Message) {
  if (message.sender_type === 'AGENT') stopTyping(chatId, null)
  const memberId = message.sender_tenant_member_id
  if (message.sender_type !== 'TENANT_MEMBER' || memberId === null) return
  stopTyping(chatId, memberId)
  const { queryKey } = tenantQueries.members()
  const team = queryClient.getQueryData<TenantMember[]>(queryKey)
  if (team && !team.some((member) => member.member_id === memberId)) void queryClient.invalidateQueries({ queryKey })
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
      // Someone is writing a reply, or stopped (live only, never replayed)
      'chat.typing': (data) => {
        const { chat_id, member_id, expires_in_seconds } = data as ChatTypingEvent
        setTyping(chat_id, member_id, expires_in_seconds)
      },
      'chat.typing_stopped': (data) => {
        const { chat_id, member_id } = data as ChatTypingEvent
        stopTyping(chat_id, member_id)
      },
      // Rare: more was missed than the server replays (200 changes): refetch what's on screen
      resync: () => {
        void queryClient.invalidateQueries({ queryKey: chatKeys.list() })
        void queryClient.invalidateQueries({ queryKey: chatKeys.allMessages() })
      },
    },
  }
}
