// Mirrors app/modules/chat/api/schemas.py
export type ChatStatus = 'ACTIVE' | 'HANDED_OFF' | 'CLOSED'

export interface Chat {
  id: string
  client_id: string
  title: string | null                // a member's name for the chat; null until one names it
  client_name: string | null          // the tenant's name for the client, else their WhatsApp profile name; null: none known
  client_phone_number: string | null  // E.164; null only if the client was deleted
  status: ChatStatus
  last_message: Message | null  // newest message, any sender; null: no messages yet
  unread_count: number          // client messages after a member last read the chat (any member)
}

export const UNTITLED_CHAT = 'Untitled chat'

// Copied from the backend's ChatEntity (CHAT_TITLE_MAX_LENGTH), for the field's limit
export const CHAT_TITLE_MAX_LENGTH = 255

// The chat's name in the list: a member's name for it, else the client's, else Untitled chat.
// Never the number: that's in the client's info popover
export function chatDisplayName(chat: Pick<Chat, 'title' | 'client_name'>) {
  return chat.title ?? chat.client_name ?? UNTITLED_CHAT
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

// Mirrors RenameChatIn: null (or blank) removes the member's name
export interface RenameChatInput {
  title: string | null
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

