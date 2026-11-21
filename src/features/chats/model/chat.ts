import { formatShortDate } from '@/shared/lib'

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
  created_at: string            // ISO 8601: when the client's first message opened it
  closed_at: string | null      // when a member closed it; null while open
}

const UNTITLED_CHAT = 'Untitled chat'

// Copied from the backend's ChatEntity (CHAT_TITLE_MAX_LENGTH), for the field's limit
export const CHAT_TITLE_MAX_LENGTH = 255

// The chat's name in the list: a member's name for it, else the client's, else Untitled chat.
// Never the number: that's in the client's info popover
export function chatDisplayName(chat: Pick<Chat, 'title' | 'client_name'>) {
  return chat.title ?? chat.client_name ?? UNTITLED_CHAT
}

// How the client's chats picker names a chat: the open one is the current chat, the others by
// when they closed and opened ("Closed 12 Nov · opened 10 Nov")
export function chatPeriodLabel(chat: Pick<Chat, 'created_at' | 'closed_at'>, now = new Date()) {
  const opened = formatShortDate(chat.created_at, now)
  if (!chat.closed_at) return `Current chat · since ${opened}`
  return `Closed ${formatShortDate(chat.closed_at, now)} · opened ${opened}`
}

export interface ChatPage {
  chats: Chat[]                         // most recently updated first
  next_after_updated_at: string | null  // null: last page
  next_after_id: string | null
}

export type SenderType = 'CLIENT' | 'AGENT' | 'TENANT_MEMBER'

export type MessageStatus = 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

// What a message holds. content is always readable, so a type this list doesn't name yet (a newer
// backend) still shows: the body falls back to content
type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'AUDIO'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'STICKER'
  | 'LOCATION'
  | 'CONTACTS'
  | 'REACTION'
  | 'INTERACTIVE'
  | 'TEMPLATE'
  | 'UNSUPPORTED'

// A file the client sent, as Meta names it; downloading it comes later (MVP 3.2)
interface MediaRef {
  meta_media_id: string
  mime_type: string
  sha256: string | null
}

// The client replied to a message, or forwarded one. Ids are Urpi's; null: a message Urpi doesn't have
interface MessageContext {
  reply_to_message_id: string | null
  forwarded: boolean
}

// One payload per type, as the backend stores it (app/modules/chat/domain/message_payloads.py)
export interface MessagePayloads {
  TEXT: Record<string, never>
  IMAGE: { media: MediaRef; caption: string | null }
  VIDEO: { media: MediaRef; caption: string | null }
  AUDIO: { media: MediaRef; voice: boolean } // voice: a voice note, not an audio file
  STICKER: { media: MediaRef; animated: boolean }
  DOCUMENT: { media: MediaRef; filename: string | null; caption: string | null }
  LOCATION: { latitude: number; longitude: number; name: string | null; address: string | null; url: string | null }
  CONTACTS: { contacts: { name: string; phones: { phone: string; wa_id: string | null }[] }[] }
  REACTION: { target_message_id: string | null; emoji: string } // emoji "": the client removed it
  INTERACTIVE: {
    kind: 'button_reply' | 'list_reply' | 'button' | 'product'
    id: string
    title: string
    description: string | null
  }
  TEMPLATE: { name: string; language: string; parameters: string[] }
  UNSUPPORTED: { meta_type: string } // Meta's name for it: order, edit, poll_creation…
}

interface MessageBase {
  id: string
  sender_type: SenderType
  sender_tenant_member_id: string | null  // TENANT_MEMBER: who wrote it; null on the others, and once the member is deleted
  content: string                // always readable: the text, or a placeholder ("📷 Photo: caption")
  status: MessageStatus | null   // null on client messages
  failure_reason: string | null  // FAILED only
  created_at: string             // ISO 8601
}

// Mirrors MessageOut (app/modules/chat/api/schemas.py): discriminated on type, so a switch on it
// narrows the payload. Any type may carry a context
export type Message = {
  [T in MessageType]: MessageBase & { type: T; payload: MessagePayloads[T] & { context?: MessageContext } }
}[MessageType]

export type MessageOf<T extends MessageType> = Extract<Message, { type: T }>

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

// Mirrors ChatTypingOut: the data of chat.typing and chat.typing_stopped (GET /events). Live only:
// never replayed after a reconnection. The client's typing never reaches us (WhatsApp doesn't send it)
export interface ChatTypingEvent {
  chat_id: string
  member_id: string | null    // the teammate writing; null: the agent
  expires_in_seconds: number  // hide it after this unless renewed; 0 on chat.typing_stopped
}
