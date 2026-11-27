import { describe, expect, it } from 'vitest'

import { serviceWindow } from '@/features/chats/model/service-window'

const now = Date.parse('2026-11-27T12:00:00Z')
const MINUTE = 60_000
const expiringIn = (ms: number) => new Date(now + ms).toISOString()

describe('serviceWindow', () => {
  it.each([
    ['a client who never wrote', null, 0, null],
    ['a window that ended', expiringIn(-MINUTE), 0, null],
    ['a window that ends now', expiringIn(0), 0, null],
    ['the last second', expiringIn(1000), 1, 1000],
    ['40 minutes left', expiringIn(40 * MINUTE), 40, MINUTE],
    ['part of a minute rounds up', expiringIn(39 * MINUTE + 1000), 40, 1000],
    ['exactly an hour left', expiringIn(60 * MINUTE), 60, MINUTE],
    ['more than an hour: nothing to say until the last one', expiringIn(90 * MINUTE), null, 30 * MINUTE],
  ])('reads %s', (_case, expiresAt, minutesLeft, changesInMs) => {
    expect(serviceWindow(expiresAt, now)).toEqual({ minutesLeft, changesInMs })
  })
})
