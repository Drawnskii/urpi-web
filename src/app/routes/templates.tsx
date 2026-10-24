import { createFileRoute } from '@tanstack/react-router'

import { messageTemplateQueries } from '@/features/message-templates'
import { TemplatesPage } from '@/pages/templates/templates-page'
import { TemplatesPageSkeleton } from '@/pages/templates/templates-page-skeleton'

export const Route = createFileRoute('/templates')({
  loader: ({ context }) => context.queryClient.ensureQueryData(messageTemplateQueries.list()),
  pendingComponent: TemplatesPageSkeleton,
  component: TemplatesPage,
})
