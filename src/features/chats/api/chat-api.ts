import { http } from '@/shared/api'

import type {
  AddMessageInput,
  Chat,
  ChatPage,
  MediaLink,
  Message,
  MessagePage,
  RenameChatInput,
  SendTemplateInput,
} from '../model/chat'

export const chatApi = {
  // latest_per_client: the inbox, one row per client (its newest chat). client_id: that client's chats
  list: (params?: {
    limit?: number
    after_updated_at?: string
    after_id?: string
    client_id?: string
    latest_per_client?: boolean
  }) => http<ChatPage>('/chats', { params }),

  // One chat as the list shows it: a client's current one or a closed one
  get: (chatId: string) => http<Chat>(`/chats/${chatId}`),

  // Nobody answers it any more; the client's next message opens a new chat. Returns the closed chat
  close: (chatId: string) => http<Chat>(`/chats/${chatId}/close`, { method: 'POST' }),

  // A member's name for the chat (null removes it); returns the chat as the list shows it
  rename: (chatId: string, input: RenameChatInput) =>
    http<Chat>(`/chats/${chatId}`, { method: 'PATCH', body: input }),

  listMessages: (chatId: string, params?: { limit?: number; before_created_at?: string; before_id?: string }) =>
    http<MessagePage>(`/chats/${chatId}/messages`, { params }),

  // 201: the message is PENDING; the backend's send worker delivers it. 409 ChatClosedError on a closed chat
  addMessage: (chatId: string, input: AddMessageInput) =>
    http<Message>(`/chats/${chatId}/messages`, { method: 'POST', body: input }),

  // 201: an approved template, PENDING like a message; it goes inside the service window or not.
  // 404 TemplateNotFoundError, 409 TemplateNotApprovedError or ChatClosedError, 422 refused values
  sendTemplate: (chatId: string, input: SendTemplateInput) =>
    http<Message>(`/chats/${chatId}/templates`, { method: 'POST', body: input }),

  // A failed text goes back to PENDING. 409 MessageNotRetryableError (it may have been sent, or it
  // isn't failed any more), ServiceWindowClosedError or ChatClosedError
  retryMessage: (chatId: string, messageId: string) =>
    http<Message>(`/chats/${chatId}/messages/${messageId}/retry`, { method: 'POST' }),

  // A signed link to a READY file, valid a few minutes. 409 MediaNotReadyError before READY
  getMedia: (chatId: string, messageId: string) =>
    http<MediaLink>(`/chats/${chatId}/messages/${messageId}/media`),

  // 204: WhatsApp's blue ticks on the client's latest message (marks every earlier one too)
  markRead: (chatId: string) => http<void>(`/chats/${chatId}/read`, { method: 'POST' }),

  // 204: the client sees "typing…" for about 25 s; also marks their messages read
  showTyping: (chatId: string) => http<void>(`/chats/${chatId}/typing`, { method: 'POST' }),
}
