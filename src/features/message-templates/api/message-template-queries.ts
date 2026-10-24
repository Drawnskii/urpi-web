import { queryOptions } from '@tanstack/react-query'

import { messageTemplateApi } from './message-template-api'

// Kept fresh by the live events stream (message-template-events.ts): no polling
export const messageTemplateKeys = {
  all: ['message-templates'] as const,
  list: () => [...messageTemplateKeys.all, 'list'] as const,
}

export const messageTemplateQueries = {
  list: () => queryOptions({ queryKey: messageTemplateKeys.list(), queryFn: messageTemplateApi.list }),
}
