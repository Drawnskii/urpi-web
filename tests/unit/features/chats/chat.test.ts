import { describe, expect, it } from 'vitest'

import { chatDisplayName, chatPeriodLabel } from '@/features/chats/model/chat'
import { formatShortDate } from '@/shared/lib'

describe('chatDisplayName', () => {
  it("is a member's name for the chat first", () => {
    expect(chatDisplayName({ title: 'Reserva sábado', client_name: 'Ana' })).toBe('Reserva sábado')
  })

  it("falls back to the client's name", () => {
    expect(chatDisplayName({ title: null, client_name: 'Ana' })).toBe('Ana')
  })

  it('falls back to Untitled chat, never the number', () => {
    expect(chatDisplayName({ title: null, client_name: null })).toBe('Untitled chat')
  })
})

describe('chatPeriodLabel', () => {
  const now = new Date(2026, 10, 20, 12, 0)
  const at = (day: number) => new Date(2026, 10, day, 9, 5).toISOString()
  const day = (d: number) => formatShortDate(at(d), now)

  it('names the open chat as the current one, since it opened', () => {
    expect(chatPeriodLabel({ created_at: at(18), closed_at: null }, now)).toBe(`Current chat · since ${day(18)}`)
  })

  it('names a closed chat by when it closed, then when it opened', () => {
    expect(chatPeriodLabel({ created_at: at(10), closed_at: at(12) }, now)).toBe(`Closed ${day(12)} · opened ${day(10)}`)
  })
})
