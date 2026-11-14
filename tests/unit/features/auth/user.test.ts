import { describe, expect, it } from 'vitest'

import { loginUrl } from '@/features/auth/model/login-url'
import { userDisplayName, userInitial, type User } from '@/features/auth/model/user'

function user(overrides: Partial<User> = {}): User {
  return { id: 'user-1', email: 'ana@example.test', first_name: null, last_name: null, ...overrides }
}

describe('userDisplayName', () => {
  it('joins the first and last name', () => {
    expect(userDisplayName(user({ first_name: 'Ana', last_name: 'López' }))).toBe('Ana López')
  })

  it('uses whichever part of the name there is', () => {
    expect(userDisplayName(user({ first_name: 'Ana' }))).toBe('Ana')
    expect(userDisplayName(user({ last_name: 'López' }))).toBe('López')
  })

  it('falls back to the email without a name', () => {
    expect(userDisplayName(user())).toBe('ana@example.test')
  })
})

describe('userInitial', () => {
  it('is the display name’s first letter, uppercase', () => {
    expect(userInitial(user({ first_name: 'ana' }))).toBe('A')
    expect(userInitial(user())).toBe('A')
  })
})

describe('loginUrl', () => {
  it('points at the backend’s sign-in route with where to come back, encoded', () => {
    expect(loginUrl('/chats/42?tab=open')).toMatch(/\/auth\/login\?return_to=%2Fchats%2F42%3Ftab%3Dopen$/)
  })
})
