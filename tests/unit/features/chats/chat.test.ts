import { describe, expect, it } from 'vitest'

import { chatDisplayName } from '@/features/chats/model/chat'

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
