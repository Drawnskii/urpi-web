import type { InfiniteData } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { moveChatToTop, removeMessage, upsertMessage } from '@/features/chats/api/chat-cache'
import type { Chat, ChatPage, Message, MessagePage } from '@/features/chats/model/chat'

function message(id: string, createdAt: string, overrides: Partial<Message> = {}): Message {
  return {
    id,
    sender_type: 'CLIENT',
    content: id,
    status: null,
    failure_reason: null,
    created_at: createdAt,
    ...overrides,
  }
}

function messagePages(pages: Message[][], hasOlder = false): InfiniteData<MessagePage> {
  return {
    pages: pages.map((messages, index) => ({
      messages,
      next_before_created_at: hasOlder || index < pages.length - 1 ? 'cursor' : null,
      next_before_id: hasOlder || index < pages.length - 1 ? 'cursor' : null,
    })),
    pageParams: pages.map(() => undefined),
  }
}

function chat(id: string): Chat {
  return { id, client_id: `client-${id}`, title: id, status: 'ACTIVE' }
}

function chatPages(pages: Chat[][]): InfiniteData<ChatPage> {
  return {
    pages: pages.map((chats) => ({ chats, next_after_updated_at: null, next_after_id: null })),
    pageParams: pages.map(() => undefined),
  }
}

const ids = (data: InfiniteData<MessagePage> | undefined, page = 0) => data?.pages[page].messages.map((m) => m.id)

describe('upsertMessage', () => {
  it('leaves an empty cache empty (the chat loads fresh when opened)', () => {
    expect(upsertMessage(undefined, message('a', '2026-10-21T10:00:00Z'))).toBeUndefined()
  })

  it('puts a message newer than everything first in the newest page', () => {
    const data = messagePages([[message('b', '2026-10-21T10:01:00Z'), message('a', '2026-10-21T10:00:00Z')]])
    expect(ids(upsertMessage(data, message('c', '2026-10-21T10:02:00Z')))).toEqual(['c', 'b', 'a'])
  })

  it('puts an out-of-order message between the two it belongs between', () => {
    const data = messagePages([[message('c', '2026-10-21T10:02:00Z'), message('a', '2026-10-21T10:00:00Z')]])
    expect(ids(upsertMessage(data, message('b', '2026-10-21T10:01:00Z')))).toEqual(['c', 'b', 'a'])
  })

  it('keeps one copy of the same id, with the second version (a replay or the own reply)', () => {
    const data = messagePages([[message('a', '2026-10-21T10:00:00Z', { status: 'SENT' })]])
    const result = upsertMessage(data, message('a', '2026-10-21T10:00:00Z', { status: 'READ' }))
    expect(result?.pages[0].messages).toEqual([message('a', '2026-10-21T10:00:00Z', { status: 'READ' })])
  })

  it('replaces a message found on an older page, where it is', () => {
    const data = messagePages([[message('b', '2026-10-21T10:01:00Z')], [message('a', '2026-10-21T10:00:00Z')]])
    const result = upsertMessage(data, message('a', '2026-10-21T10:00:00Z', { content: 'edited' }))
    expect(ids(result, 0)).toEqual(['b'])
    expect(result?.pages[1].messages[0].content).toBe('edited')
  })

  it('skips a message older than the newest page when older pages exist (an unloaded page)', () => {
    const data = messagePages([[message('b', '2026-10-21T10:01:00Z')]], true)
    expect(upsertMessage(data, message('a', '2026-10-21T10:00:00Z'))).toBe(data)
  })

  it('inserts that older message at the end when the whole chat is loaded', () => {
    const data = messagePages([[message('b', '2026-10-21T10:01:00Z')]])
    expect(ids(upsertMessage(data, message('a', '2026-10-21T10:00:00Z')))).toEqual(['b', 'a'])
  })

  it('orders by time, not by text, when the formats differ (an optimistic message)', () => {
    const data = messagePages([[message('server', '2026-10-21T10:00:00.500000Z')]])
    expect(ids(upsertMessage(data, message('optimistic', '2026-10-21T10:00:00.900Z')))).toEqual(['optimistic', 'server'])
  })

  it('breaks a time tie by id, newest id first', () => {
    const data = messagePages([[message('01a1', '2026-10-21T10:00:00Z')]])
    expect(ids(upsertMessage(data, message('01a2', '2026-10-21T10:00:00Z')))).toEqual(['01a2', '01a1'])
  })
})

describe('removeMessage', () => {
  it('removes only that id, on every page', () => {
    const data = messagePages([[message('b', '2026-10-21T10:01:00Z')], [message('a', '2026-10-21T10:00:00Z')]])
    const result = removeMessage(data, 'a')
    expect(ids(result, 0)).toEqual(['b'])
    expect(ids(result, 1)).toEqual([])
  })
})

describe('moveChatToTop', () => {
  it('returns undefined for a chat that is not loaded (a new chat)', () => {
    expect(moveChatToTop(chatPages([[chat('a')]]), 'new')).toBeUndefined()
  })

  it('moves a known chat from page 2 to the top of page 1', () => {
    const result = moveChatToTop(chatPages([[chat('a'), chat('b')], [chat('c')]]), 'c')
    expect(result?.pages.map((page) => page.chats.map((c) => c.id))).toEqual([['c', 'a', 'b'], []])
  })
})
