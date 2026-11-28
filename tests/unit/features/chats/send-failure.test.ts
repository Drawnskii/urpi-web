import { describe, expect, it } from 'vitest'

import type { SendFailure } from '@/features/chats/model/chat'
import { failureNotice, type FailureAction } from '@/features/chats/model/send-failure'

// Typed as a record, so a reason added to SendFailure must be given its action here
const ACTIONS: Record<SendFailure, FailureAction | undefined> = {
  OUTSIDE_WINDOW: 'template',
  PAYMENT_METHOD: 'payment',
  UNDELIVERABLE: undefined,
  MARKETING_STOPPED: undefined,
  MARKETING_LIMITED: undefined,
  SPAM_LIMITED: undefined,
  TEMPLATE: 'templates',
  NOT_CONNECTED: 'number',
  NO_RECIPIENT: undefined,
  RATE_LIMITED: 'retry',
  UNAVAILABLE: 'retry',
  OUTCOME_UNKNOWN: undefined,
  REJECTED: undefined,
}
const REASONS = Object.keys(ACTIONS) as SendFailure[]

function notice(failure_reason: SendFailure | null, type: 'TEXT' | 'TEMPLATE' = 'TEXT', failure_code: number | null = null) {
  return failureNotice({ type, failure_reason, failure_code })
}

describe('failureNotice', () => {
  it('says nothing about a message that did not fail', () => {
    expect(notice(null)).toBeUndefined()
  })

  it.each(REASONS)('offers what can be done after %s', (reason) => {
    expect(notice(reason)?.action).toBe(ACTIONS[reason])
  })

  it('gives each reason its own words', () => {
    expect(new Set(REASONS.map((reason) => notice(reason)?.reason)).size).toBe(REASONS.length)
  })

  it.each(['RATE_LIMITED', 'UNAVAILABLE'] as const)('chooses a template afresh instead of retrying it after %s', (reason) => {
    expect(notice(reason, 'TEMPLATE')?.action).toBe('template')
  })

  it("names Meta's code for a refusal it can't explain", () => {
    expect(notice('REJECTED', 'TEXT', 131009)?.reason).toBe('Not delivered: WhatsApp refused it (error 131009).')
    expect(notice('REJECTED')?.reason).toBe('Not delivered: WhatsApp refused it.')
  })

  it("reads a reason it doesn't know yet as a refusal", () => {
    expect(notice('SOMETHING_NEW' as SendFailure, 'TEXT', 7)).toEqual({
      reason: 'Not delivered: WhatsApp refused it (error 7).',
    })
  })
})
