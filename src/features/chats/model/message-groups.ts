import { toLocalDay } from '@/shared/lib'

import type { Message } from './chat'

export interface MessageDayGroup {
  day: string // "2026-10-16", the viewer's calendar day
  messages: Message[]
}

// Which side of the chat a message sits on: the client's, or the business's (agent and members alike)
export type MessageSide = 'client' | 'business'

// Consecutive messages from one side: drawn close together, as one chain of bubbles
export interface MessageRun {
  side: MessageSide
  messages: Message[]
}

function messageSide(message: Message): MessageSide {
  return message.sender_type === 'CLIENT' ? 'client' : 'business'
}

// Consecutive messages of the same day, in the order given (oldest first in the chat)
export function groupMessagesByDay(messages: Message[]): MessageDayGroup[] {
  const groups: MessageDayGroup[] = []
  for (const message of messages) {
    const day = toLocalDay(message.created_at)
    const last = groups.at(-1)
    if (last?.day === day) last.messages.push(message)
    else groups.push({ day, messages: [message] })
  }
  return groups
}

// Consecutive messages of the same side, in the order given: a new run each time the turn changes
export function groupMessagesBySide(messages: Message[]): MessageRun[] {
  const runs: MessageRun[] = []
  for (const message of messages) {
    const side = messageSide(message)
    const last = runs.at(-1)
    if (last?.side === side) last.messages.push(message)
    else runs.push({ side, messages: [message] })
  }
  return runs
}
