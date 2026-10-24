// Embedded Signup v4: what Meta's popup posts to this window (window.postMessage), parsed.
// Pure: no SDK, no DOM, so it's unit tested

export interface EmbeddedSignupIds {
  waba_id: string
  phone_number_id: string
  business_id: string
}

export type EmbeddedSignupMessage =
  | { kind: 'finished'; ids: EmbeddedSignupIds }
  | { kind: 'cancelled'; step: string | null } // where the business left: useful product data
  | { kind: 'incomplete' }                     // finished without a phone number (FINISH_ONLY_WABA)

// Only Meta's popup: facebook.com or a subdomain. endsWith('facebook.com') alone would let
// evilfacebook.com in
function isFacebookOrigin(origin: string) {
  try {
    const { hostname, protocol } = new URL(origin)
    return protocol === 'https:' && (hostname === 'facebook.com' || hostname.endsWith('.facebook.com'))
  } catch {
    return false
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function asString(value: unknown) {
  return typeof value === 'string' && value !== '' ? value : null
}

// null: not an Embedded Signup message (other windows, Meta's other messages, malformed data)
export function parseEmbeddedSignupMessage(origin: string, data: unknown): EmbeddedSignupMessage | null {
  if (!isFacebookOrigin(origin) || typeof data !== 'string') return null

  let message: Record<string, unknown> | null
  try {
    message = asRecord(JSON.parse(data))
  } catch {
    return null
  }
  if (message?.type !== 'WA_EMBEDDED_SIGNUP') return null

  const event = asString(message.event)
  const details = asRecord(message.data) ?? {}

  if (event === 'CANCEL') return { kind: 'cancelled', step: asString(details.current_step) }
  if (!event?.startsWith('FINISH')) return null

  const waba_id = asString(details.waba_id)
  const phone_number_id = asString(details.phone_number_id)
  const business_id = asString(details.business_id)
  if (!waba_id || !phone_number_id || !business_id) return { kind: 'incomplete' }
  return { kind: 'finished', ids: { waba_id, phone_number_id, business_id } }
}
