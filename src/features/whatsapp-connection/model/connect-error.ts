import { isApiError } from '@/shared/api'

// What went wrong connecting or retrying, in the business's words. Chosen by the backend's error
// code, never by parsing its message (the 409s' detail is only an id)
const BY_CODE: Record<string, string> = {
  WhatsAppNumberAlreadyConnectedError:
    'This number is already connected to another business in Urpi. Disconnect it there first, then try again.',
  WhatsAppAccountAlreadyConnectedError: 'This business already has a WhatsApp number. Disconnect it to connect another.',
}

export function connectErrorText(error: Error) {
  if (!isApiError(error)) return 'Connecting failed. Check your connection and try again.'
  const known = error.code ? BY_CODE[error.code] : undefined
  if (known) return known
  // 502: the number is saved and Meta refused a later step. Its reason is the message ("Meta error 100/33: …")
  if (error.isBadGateway) return `Meta refused a step: ${error.message}. Retry to finish it.`
  return error.message
}
