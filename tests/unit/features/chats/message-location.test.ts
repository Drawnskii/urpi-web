import { describe, expect, it } from 'vitest'

import type { MessagePayloads } from '@/features/chats/model/chat'
import { locationUrl } from '@/features/chats/model/message-location'

function location(url: string | null): MessagePayloads['LOCATION'] {
  return { latitude: -0.18, longitude: -78.48, name: null, address: null, url }
}

describe('locationUrl', () => {
  it('opens the coordinates on Google Maps', () => {
    expect(locationUrl(location(null))).toBe('https://www.google.com/maps?q=-0.18,-78.48')
  })

  it("uses Meta's own https link for a business location", () => {
    expect(locationUrl(location('https://maps.example/place'))).toBe('https://maps.example/place')
  })

  it.each(['javascript:alert(1)', 'http://plain.example'])('never trusts a %s link', (url) => {
    expect(locationUrl(location(url))).toBe('https://www.google.com/maps?q=-0.18,-78.48')
  })
})
