import { http, isApiError } from '@/shared/api'

import type { ConnectWhatsAppAccountInput, WhatsAppConnection } from '../model/whatsapp-connection'

export const whatsAppConnectionApi = {
  // The tenant's live number (CONNECTING or ACTIVE); null when it has none (404)
  get: async () => {
    try {
      return await http<WhatsAppConnection>('/whatsapp/connections')
    } catch (error) {
      if (isApiError(error) && error.isNotFound) return null
      throw error
    }
  },

  // 201 ACTIVE. 409: already connected, or the number is another tenant's. 502: Meta failed a step
  connect: (input: ConnectWhatsAppAccountInput) =>
    http<WhatsAppConnection>('/whatsapp/connections', { method: 'POST', body: input }),

  // Finishes a connection that stayed CONNECTING (no new popup needed). 404: nothing to finish
  finish: () => http<WhatsAppConnection>('/whatsapp/connections/retry', { method: 'POST' }),
}
