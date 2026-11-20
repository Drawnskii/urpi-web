import { describe, expect, it } from 'vitest'

import type { Message, SenderType } from '@/features/chats/model/chat'
import { groupMessagesByDay, groupMessagesBySide } from '@/features/chats/model/message-groups'

function message(id: string, day: number, hours: number, sender_type: SenderType = 'CLIENT'): Message {
  return {
    id,
    sender_type,
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

describe('groupMessagesBySide', () => {
  it('starts a run each time the turn changes, the agent and members on one side', () => {
    const runs = groupMessagesBySide([
      message('a', 16, 9),
      message('b', 16, 9),
      message('c', 16, 10, 'AGENT'),
      message('d', 16, 10, 'TENANT_MEMBER'),
      message('e', 16, 11),
    ])
    expect(runs.map((run) => [run.side, run.messages.map((m) => m.id)])).toEqual([
      ['client', ['a', 'b']],
      ['business', ['c', 'd']],
      ['client', ['e']],
    ])
  })

  it('has no runs without messages', () => {
    expect(groupMessagesBySide([])).toEqual([])
  })
})
