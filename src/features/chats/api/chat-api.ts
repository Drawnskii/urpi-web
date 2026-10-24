import { http } from '@/shared/api'

import type { AddMessageInput, ChatPage, Message, MessagePage } from '../model/chat'

export const chatApi = {
  list: (params?: { limit?: number; after_updated_at?: string; after_id?: string }) =>
    http<ChatPage>('/chats', { params }),

  listMessages: (chatId: string, params?: { limit?: number; before_created_at?: string; before_id?: string }) =>
    http<MessagePage>(`/chats/${chatId}/messages`, { params }),

  // 201: the message is PENDING; the backend's send worker delivers it
  addMessage: (chatId: string, input: AddMessageInput) =>
    http<Message>(`/chats/${chatId}/messages`, { method: 'POST', body: input }),

  // 204: WhatsApp's blue ticks on the client's latest message (marks every earlier one too)
  markRead: (chatId: string) => http<void>(`/chats/${chatId}/read`, { method: 'POST' }),

  // 204: the client sees "typing…" for about 25 s; also marks their messages read
  showTyping: (chatId: string) => http<void>(`/chats/${chatId}/typing`, { method: 'POST' }),
}
