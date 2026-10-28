import { useSuspenseQuery } from '@tanstack/react-query'

import { Badge } from '@/shared/components/ui/badge'

import { messageTemplateQueries } from '../api/message-template-queries'
import type { MessageTemplate, MessageTemplateStatus } from '../model/message-template'

const STATUS_VARIANTS: Partial<Record<MessageTemplateStatus, 'default' | 'secondary' | 'destructive'>> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
}

const CATEGORY_LABELS: Record<MessageTemplate['category'], string> = {
  UTILITY: 'Utility',
  MARKETING: 'Marketing',
  AUTHENTICATION: 'Authentication',
}

export function TemplateList() {
  const { data: templates } = useSuspenseQuery(messageTemplateQueries.list())

  if (templates.length === 0) return <p className="text-muted-foreground">No templates yet. Create one to send it to Meta's review.</p>

  return (
    <ul className="flex flex-col gap-4">
      {templates.map((template) => (
        <li key={template.id} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-h4">{template.name}</h3>
            <small>{template.language}</small>
            <Badge variant="outline">{template.category}</Badge>
            <Badge variant={STATUS_VARIANTS[template.status] ?? 'outline'}>{template.status}</Badge>
          </div>
          {/* Meta moves templates on its own; Marketing is charged differently, so say so */}
          {template.previous_category && template.previous_category !== template.category && (
            <p className="text-body-sm text-muted-foreground">
              Meta moved it from {CATEGORY_LABELS[template.previous_category]} to {CATEGORY_LABELS[template.category]}
              {template.category === 'MARKETING' && ' (charged differently)'}.
            </p>
          )}
          {template.status === 'REJECTED' && template.rejected_reason && (
            <p role="alert" className="text-body-sm text-destructive">Rejected: {template.rejected_reason}</p>
          )}
          <p className="whitespace-pre-wrap">{template.body}</p>
        </li>
      ))}
    </ul>
  )
}
