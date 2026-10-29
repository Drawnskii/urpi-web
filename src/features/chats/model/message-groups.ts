import { toLocalDay } from '@/shared/lib'

import type { Message } from './chat'

export interface MessageDayGroup {
  day: string // "2026-10-16", the viewer's calendar day
  messages: Message[]
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
