import { describe, expect, it } from 'vitest'

import type { Message } from '@/features/chats/model/chat'
import {
  authorFullName,
  authorShortName,
  messageAuthor,
  respondingLabel,
  sameAuthor,
  typingAuthor,
  type Team,
} from '@/features/chats/model/message-author'

const team: Team = {
  myMemberId: 'me',
  members: new Map([
    ['me', { member_id: 'me', first_name: 'Sam', last_name: 'Ruiz' }],
    ['ana', { member_id: 'ana', first_name: 'Ana', last_name: 'García' }],
    ['nameless', { member_id: 'nameless', first_name: null, last_name: null }],
  ]),
}

function sentBy(sender_type: Message['sender_type'], sender_tenant_member_id: string | null = null) {
  return { sender_type, sender_tenant_member_id }
}

describe('message authors', () => {
  it('prefixes the preview with You, the teammate’s first name or Urpi, and nothing for the client', () => {
    expect(authorShortName(messageAuthor(sentBy('TENANT_MEMBER', 'me'), team))).toBe('You')
    expect(authorShortName(messageAuthor(sentBy('TENANT_MEMBER', 'ana'), team))).toBe('Ana')
    expect(authorShortName(messageAuthor(sentBy('AGENT'), team))).toBe('Urpi')
    expect(authorShortName(messageAuthor(sentBy('CLIENT'), team))).toBeNull()
  })

  it('names a bubble’s author in full, and not the signed-in member’s own', () => {
    expect(authorFullName(messageAuthor(sentBy('TENANT_MEMBER', 'ana'), team))).toBe('Ana García')
    expect(authorFullName(messageAuthor(sentBy('AGENT'), team))).toBe('Urpi')
    expect(authorFullName(messageAuthor(sentBy('TENANT_MEMBER', 'me'), team))).toBeNull()
    expect(authorFullName(messageAuthor(sentBy('CLIENT'), team))).toBeNull()
  })

  it('stands in for a teammate without a name, one not loaded yet, and a deleted one', () => {
    expect(authorFullName(messageAuthor(sentBy('TENANT_MEMBER', 'nameless'), team))).toBe('A teammate')
    expect(authorShortName(messageAuthor(sentBy('TENANT_MEMBER', 'new'), team))).toBe('A teammate')
    expect(authorFullName(messageAuthor(sentBy('TENANT_MEMBER', null), team))).toBe('A former teammate')
  })

  it('says who is responding, leaving out the signed-in member', () => {
    expect(respondingLabel([typingAuthor('ana', team)])).toBe('Ana is responding')
    expect(respondingLabel([typingAuthor(null, team)])).toBe('Urpi is responding')
    expect(respondingLabel([typingAuthor('ana', team), typingAuthor('me', team), typingAuthor(null, team)])).toBe(
      'Ana and Urpi are responding',
    )
    expect(respondingLabel([typingAuthor('me', team)])).toBeNull()
    expect(respondingLabel([])).toBeNull()
  })

  it('tells two teammates apart, and the agent from a teammate', () => {
    const ana = { ...sentBy('TENANT_MEMBER', 'ana') } as Message
    expect(sameAuthor(ana, { ...ana })).toBe(true)
    expect(sameAuthor(ana, sentBy('TENANT_MEMBER', 'me') as Message)).toBe(false)
    expect(sameAuthor(ana, sentBy('AGENT') as Message)).toBe(false)
  })
})
