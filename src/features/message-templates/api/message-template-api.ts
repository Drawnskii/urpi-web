import { http } from '@/shared/api'

import type { CreateMessageTemplateInput, MessageTemplate } from '../model/message-template'

export const messageTemplateApi = {
  // The tenant's templates for its WhatsApp number, from the backend's copy. Empty without a number
  list: () => http<MessageTemplate[]>('/templates'),

  // 201 PENDING. 404: no ACTIVE number. 409: name and language taken. 422: invalid draft.
  // 502: Meta refused or failed, with its reason as the message
  create: (input: CreateMessageTemplateInput) => http<MessageTemplate>('/templates', { method: 'POST', body: input }),
}
