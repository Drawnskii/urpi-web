// WhatsApp's customer service window as the composer counts it down. The rule is the backend's: it
// says until when free text reaches the client (Chat.window_expires_at); this only reads the clock

// From here on the composer warns that the window is closing
const CLOSING_SOON_MS = 60 * 60_000
const MINUTE_MS = 60_000

interface ServiceWindow {
  minutesLeft: number | null // 0: closed. Up to 60: closing soon. null: open, with more than an hour left
  changesInMs: number | null // when minutesLeft next changes; null: only a new expiry changes it
}

export function serviceWindow(expiresAt: string | null, now: number): ServiceWindow {
  const left = expiresAt === null ? 0 : Date.parse(expiresAt) - now
  if (left <= 0) return { minutesLeft: 0, changesInMs: null }
  if (left > CLOSING_SOON_MS) return { minutesLeft: null, changesInMs: left - CLOSING_SOON_MS }
  // Rounded up: "1 min" until the very end, never "0 min" while a message still goes through
  const minutesLeft = Math.ceil(left / MINUTE_MS)
  return { minutesLeft, changesInMs: left - (minutesLeft - 1) * MINUTE_MS }
}
