// Mirrors app/modules/chat/api/schemas.py
export interface Chat {
  id: string
  client_id: string
  title: string
  status: string
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

// Mirrors ChatEventOut: the data of message.created and message.updated (GET /events)
export interface ChatEvent {
  chat_id: string
  message: Message
}

