import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getChatWriters, setTyping, stopTyping } from '@/features/chats/model/typing-store'

function writersOf(chatId: string) {
  return getChatWriters(chatId).map((writer) => writer.memberId)
}

describe('typing store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    stopTyping('c1', 'ana')
    stopTyping('c1', null)
    vi.useRealTimers()
  })

  it('shows a writer until the time the event gave runs out', () => {
    setTyping('c1', 'ana', 25)
    expect(writersOf('c1')).toEqual(['ana'])

    vi.advanceTimersByTime(25_000)
    expect(writersOf('c1')).toEqual([])
  })

  it('keeps a renewed writer past the first expiry, in their place', () => {
    setTyping('c1', 'ana', 25)
    setTyping('c1', null, 60)
    vi.advanceTimersByTime(20_000)
    setTyping('c1', 'ana', 25)

    vi.advanceTimersByTime(10_000) // the first 25 s are over: renewed, so still there
    expect(writersOf('c1')).toEqual(['ana', null])
  })

  it('hides a writer on a stop, or a zero expiry', () => {
    setTyping('c1', 'ana', 25)
    setTyping('c1', null, 60)

    stopTyping('c1', 'ana')
    setTyping('c1', null, 0)

    expect(writersOf('c1')).toEqual([])
  })
})
