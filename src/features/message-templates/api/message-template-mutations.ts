import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MessageTemplate } from '../model/message-template'
import { messageTemplateApi } from './message-template-api'
import { upsertTemplate } from './message-template-cache'
import { messageTemplateKeys } from './message-template-queries'

// The response is the stored template (PENDING): it goes into the list, no refetch. Its review
// arrives later over the live events stream
export function useCreateMessageTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: messageTemplateApi.create,
    onSuccess: (template) => {
      queryClient.setQueryData<MessageTemplate[]>(messageTemplateKeys.list(), (templates) =>
        upsertTemplate(templates, template),
      )
    },
  })
}
