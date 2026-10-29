import { describe, expect, it } from 'vitest'

import { formatDayLabel, formatTime, toLocalDay } from '@/shared/lib/format-date'

// Built from local times, so the expectations hold in any timezone the tests run in
const localIso = (day: number, hours: number, minutes: number) => new Date(2026, 9, day, hours, minutes).toISOString()
const now = new Date(2026, 9, 24, 0, 10) // 24 October 2026, 00:10

describe('formatTime', () => {
  it('shows the instant in the local timezone, 24-hour', () => {
    expect(formatTime(localIso(24, 14, 5))).toBe('14:05')
  })

  it('shows midnight as 00, never 24', () => {
    expect(formatTime(localIso(24, 0, 5))).toBe('00:05')
  })
})

describe('toLocalDay', () => {
  it('is the local calendar day', () => {
    expect(toLocalDay(localIso(16, 23, 59))).toBe('2026-10-16')
    expect(toLocalDay(localIso(17, 0, 1))).toBe('2026-10-17')
  })
})

describe('formatDayLabel', () => {
  const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const capitalized = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1)

  it('says today for any time today', () => {
    expect(formatDayLabel(localIso(24, 0, 1), now)).toBe(capitalized(relative.format(0, 'day')))
  })

  it('says yesterday by calendar day, even 20 minutes ago', () => {
    expect(formatDayLabel(localIso(23, 23, 50), now)).toBe(capitalized(relative.format(-1, 'day')))
  })

  it('gives the full date from two days back', () => {
    const label = formatDayLabel(localIso(16, 9, 0), now)
    expect(label).toContain('2026')
    expect(label).toContain('16')
  })

  it('treats a date slightly ahead of now as today', () => {
    expect(formatDayLabel(localIso(24, 0, 15), now)).toBe(capitalized(relative.format(0, 'day')))
  })
})
