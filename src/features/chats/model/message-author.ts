import { memberFullName, memberShortName, type TenantMember } from '@/features/tenants'

import type { Message } from './chat'

// The agent's name in the app
const AGENT_NAME = 'Urpi'
// A teammate without a name (WorkOS doesn't require one), or not in the list yet
const UNNAMED_MEMBER = 'A teammate'
// A member deleted since: their messages keep no author
const FORMER_MEMBER = 'A former teammate'

// The signed-in member and their teammates by id: who "You" is, and everyone else's name
export interface Team {
  myMemberId: string | null
  members: ReadonlyMap<string, TenantMember>
}

// Who wrote a message, or is writing one, as the signed-in member sees it
export type Author =
  | { kind: 'client' }
  | { kind: 'self' }
  | { kind: 'agent' }
  | { kind: 'member'; member: TenantMember | undefined } // undefined: not in the team list (yet)
  | { kind: 'former-member' }

export function messageAuthor(message: Pick<Message, 'sender_type' | 'sender_tenant_member_id'>, team: Team): Author {
  if (message.sender_type === 'CLIENT') return { kind: 'client' }
  if (message.sender_type === 'AGENT') return { kind: 'agent' }
  const memberId = message.sender_tenant_member_id
  return memberId === null ? { kind: 'former-member' } : memberAuthor(memberId, team)
}

// Someone writing a reply (chat.typing): a teammate by id, or the agent (null)
export function typingAuthor(memberId: string | null, team: Team): Author {
  return memberId === null ? { kind: 'agent' } : memberAuthor(memberId, team)
}

function memberAuthor(memberId: string, team: Team): Author {
  if (memberId === team.myMemberId) return { kind: 'self' }
  return { kind: 'member', member: team.members.get(memberId) }
}

// The list's preview prefix: "You", "Ana", "Urpi"; null for the client's own messages
export function authorShortName(author: Author): string | null {
  switch (author.kind) {
    case 'client':
      return null
    case 'self':
      return 'You'
    case 'agent':
      return AGENT_NAME
    case 'member':
      return (author.member && memberShortName(author.member)) ?? UNNAMED_MEMBER
    case 'former-member':
      return FORMER_MEMBER
  }
}

// Under a bubble: "Ana García", "Urpi"; null for the signed-in member's own and the client's
export function authorFullName(author: Author): string | null {
  switch (author.kind) {
    case 'client':
    case 'self':
      return null
    case 'agent':
      return AGENT_NAME
    case 'member':
      return (author.member && memberFullName(author.member)) ?? UNNAMED_MEMBER
    case 'former-member':
      return FORMER_MEMBER
  }
}

// "Ana is responding", "Ana and Urpi are responding": who is writing, the signed-in member left out
export function respondingLabel(authors: Author[]): string | null {
  const names = authors.filter((author) => author.kind !== 'self').map(authorShortName)
  if (names.length === 0) return null
  if (names.length === 1) return `${names[0]} is responding`
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)} are responding`
}

// Whether two consecutive messages share an author: the name shows once, under the last of them
export function sameAuthor(a: Message, b: Message) {
  return a.sender_type === b.sender_type && a.sender_tenant_member_id === b.sender_tenant_member_id
}
