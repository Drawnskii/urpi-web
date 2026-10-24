import { describe, expect, it } from 'vitest'

import { connectErrorText } from '@/features/whatsapp-connection/model/connect-error'
import { ApiError } from '@/shared/api/api-error'

describe('connectErrorText', () => {
  it('says the number belongs to another business, never the id the backend sends', () => {
    const error = new ApiError(409, { detail: '01a14c99-f024-767c-aa12-3b6d62c72b15', error: 'WhatsAppNumberAlreadyConnectedError' })

    expect(connectErrorText(error)).toBe(
      'This number is already connected to another business in Urpi. Disconnect it there first, then try again.',
    )
  })

  it('says the business already has a number', () => {
    const error = new ApiError(409, { detail: 'x', error: 'WhatsAppAccountAlreadyConnectedError' })

    expect(connectErrorText(error)).toBe('This business already has a WhatsApp number. Disconnect it to connect another.')
  })

  it('gives Meta’s reason for a refused step, and says a retry finishes it', () => {
    const error = new ApiError(502, { detail: 'Meta error 100/33: Unsupported post request', error: 'WhatsAppOnboardingError' })

    expect(connectErrorText(error)).toBe('Meta refused a step: Meta error 100/33: Unsupported post request. Retry to finish it.')
  })

  it('falls back to the backend’s message, or a network hint', () => {
    expect(connectErrorText(new ApiError(422, { detail: 'code expired' }))).toBe('code expired')
    expect(connectErrorText(new TypeError('Failed to fetch'))).toBe('Connecting failed. Check your connection and try again.')
  })
})
