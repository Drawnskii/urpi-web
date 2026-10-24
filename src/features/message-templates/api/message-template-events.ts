import type { QueryClient } from '@tanstack/react-query'

import type { LiveEventsSubscriber } from '@/shared/api'
import { patchOrRefetch } from '@/shared/lib'

import type { MessageTemplate } from '../model/message-template'
import { upsertTemplate } from './message-template-cache'
import { messageTemplateKeys } from './message-template-queries'

// The templates' part of the live events stream: Meta's reviews and re-categorizations reach the
// backend by webhook, and the stream pushes the changed template. After a reconnection the server
// replays the templates that changed meanwhile, like messages: nothing to refetch
export function templateLiveEvents(queryClient: QueryClient): LiveEventsSubscriber {
  return {
    events: {
      'template.updated': (data) =>
        patchOrRefetch<MessageTemplate[]>(queryClient, messageTemplateKeys.list(), (templates) =>
          upsertTemplate(templates, data as MessageTemplate),
        ),
    },
  }
}
