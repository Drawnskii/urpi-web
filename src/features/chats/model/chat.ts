// Mirrors app/modules/chat/api/schemas.py
export type ChatStatus = 'ACTIVE' | 'HANDED_OFF' | 'CLOSED'

export interface Chat {
  id: string
  client_id: string
  title: string
  status: ChatStatus
  last_message: Message | null  // newest message, any sender; null: no messages yet
  unread_count: number          // client messages after a member last read the chat (any member)
}

export interface ChatPage {
  chats: Chat[]                         // most recently updated first
  next_after_updated_at: string | null  // null: last page
  next_after_id: string | null
}

export type SenderType = 'CLIENT' | 'AGENT' | 'TENANT_MEMBER'

export type MessageStatus = 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

export interface Message {
  id: string
  sender_type: SenderType
  content: string
  status: MessageStatus | null   // null on client messages
  failure_reason: string | null  // FAILED only
  created_at: string             // ISO 8601
}

export interface MessagePage {
  messages: Message[]                    // newest first
  next_before_created_at: string | null  // null: no older messages
  next_before_id: string | null
}

// Mirrors AddMessageIn
export interface AddMessageInput {
  content: string
}

// Mirrors ChatReadOut: the data of chat.read (GET /events). The count as of when it was pushed,
// so a replayed chat.read already includes client messages that came after the read
export interface ChatReadEvent {
  chat_id: string
  unread_count: number
}

// Mirrors ChatEventOut: the data of message.created and message.updated (GET /events)
export interface ChatEvent {
  chat_id: string
  message: Message
}

