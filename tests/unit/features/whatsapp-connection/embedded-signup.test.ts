import { describe, expect, it } from 'vitest'

import { parseEmbeddedSignupMessage } from '@/features/whatsapp-connection/model/embedded-signup'

const META = 'https://www.facebook.com'

function signupMessage(event: string, data: Record<string, unknown> = {}) {
  return JSON.stringify({ type: 'WA_EMBEDDED_SIGNUP', event, data })
}

const ids = { waba_id: 'waba-1', phone_number_id: 'phone-1', business_id: 'business-1' }

describe('parseEmbeddedSignupMessage', () => {
  it('reads the ids when the business finishes', () => {
    expect(parseEmbeddedSignupMessage(META, signupMessage('FINISH', ids))).toEqual({ kind: 'finished', ids })
  })

  it('accepts every FINISH variant', () => {
    expect(parseEmbeddedSignupMessage(META, signupMessage('FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING', ids))).toEqual({
      kind: 'finished',
      ids,
    })
  })

  it('reports a finish without a phone number as incomplete', () => {
    const { phone_number_id: _, ...withoutPhone } = ids
    expect(parseEmbeddedSignupMessage(META, signupMessage('FINISH_ONLY_WABA', withoutPhone))).toEqual({
      kind: 'incomplete',
    })
  })

  it('reports where the business cancelled', () => {
    expect(parseEmbeddedSignupMessage(META, signupMessage('CANCEL', { current_step: 'PHONE_NUMBER_SETUP' }))).toEqual({
      kind: 'cancelled',
      step: 'PHONE_NUMBER_SETUP',
    })
  })

  it('accepts a cancel without a step', () => {
    expect(parseEmbeddedSignupMessage(META, signupMessage('CANCEL'))).toEqual({ kind: 'cancelled', step: null })
  })

  it.each([
    ['another site', 'https://example.com'],
    ['a look-alike domain', 'https://evilfacebook.com'],
    ['plain http', 'http://www.facebook.com'],
    ['a malformed origin', 'not a url'],
  ])('ignores messages from %s', (_case, origin) => {
    expect(parseEmbeddedSignupMessage(origin, signupMessage('FINISH', ids))).toBeNull()
  })

  it('ignores non-JSON data, other message types and other events', () => {
    expect(parseEmbeddedSignupMessage(META, 'not json')).toBeNull()
    expect(parseEmbeddedSignupMessage(META, { type: 'WA_EMBEDDED_SIGNUP' })).toBeNull()
    expect(parseEmbeddedSignupMessage(META, JSON.stringify({ type: 'OTHER', event: 'FINISH', data: ids }))).toBeNull()
    expect(parseEmbeddedSignupMessage(META, signupMessage('ERROR'))).toBeNull()
  })
})
