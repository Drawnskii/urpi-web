import { queryOptions } from '@tanstack/react-query'

import { whatsAppConnectionApi } from './whatsapp-connection-api'

export const whatsAppConnectionKeys = {
  all: ['whatsapp-connection'] as const,
  detail: () => [...whatsAppConnectionKeys.all, 'current'] as const,
}

export const whatsAppConnectionQueries = {
  // The tenant has one live number at most: no id needed
  detail: () => queryOptions({ queryKey: whatsAppConnectionKeys.detail(), queryFn: whatsAppConnectionApi.get }),
}
