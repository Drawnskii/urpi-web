import { describe, expect, it } from 'vitest'

import type { Message } from '@/features/chats/model/chat'
import { groupMessagesByDay } from '@/features/chats/model/message-groups'

function message(id: string, day: number, hours: number): Message {
  return {
    id,
    sender_type: 'CLIENT',
    content: id,
    status: null,
    failure_reason: null,
    created_at: new Date(2026, 9, day, hours, 0).toISOString(),
  }
}

describe('groupMessagesByDay', () => {
  it('groups consecutive messages of the same local day, keeping their order', () => {
    const groups = groupMessagesByDay([message('a', 16, 9), message('b', 16, 23), message('c', 17, 0), message('d', 17, 8)])
    expect(groups.map((group) => [group.day, group.messages.map((m) => m.id)])).toEqual([
      ['2026-10-16', ['a', 'b']],
      ['2026-10-17', ['c', 'd']],
    ])
  })

  it('has no groups without messages', () => {
    expect(groupMessagesByDay([])).toEqual([])
  })
})
