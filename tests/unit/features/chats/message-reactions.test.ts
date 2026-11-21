import { describe, expect, it } from 'vitest'

import type { Message } from '@/features/chats/model/chat'
import { isReaction, reactionsByTarget } from '@/features/chats/model/message-reactions'

function base(id: string) {
  return {
    id,
    sender_type: 'CLIENT' as const,
    sender_tenant_member_id: null,
    status: null,
    failure_reason: null,
    created_at: '2026-11-21T10:00:00Z',
  }
}

function text(id: string): Message {
  return { ...base(id), content: id, type: 'TEXT', payload: {} }
}

function reaction(id: string, target: string | null, emoji: string): Message {
  return { ...base(id), content: emoji, type: 'REACTION', payload: { target_message_id: target, emoji } }
}

describe('reactionsByTarget', () => {
  it('maps each reacted message to its emoji', () => {
    expect(reactionsByTarget([text('a'), reaction('r1', 'a', '👍')])).toEqual(new Map([['a', '👍']]))
  })

  it('keeps the newest reaction per message', () => {
    expect(reactionsByTarget([reaction('r1', 'a', '👍'), reaction('r2', 'a', '❤️')]).get('a')).toBe('❤️')
  })

  it('drops a reaction the client removed', () => {
    expect(reactionsByTarget([reaction('r1', 'a', '👍'), reaction('r2', 'a', '')]).has('a')).toBe(false)
  })

  it('ignores reactions to a message Urpi does not have, and every other message', () => {
    expect(reactionsByTarget([reaction('r1', null, '👍'), text('a')]).size).toBe(0)
  })
})

describe('isReaction', () => {
  it('tells reactions from other messages', () => {
    expect([text('a'), reaction('r', 'a', '👍')].map(isReaction)).toEqual([false, true])
  })
})
