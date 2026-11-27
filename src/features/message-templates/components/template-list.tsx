import { useSuspenseQuery } from '@tanstack/react-query'
import { RefreshCwIcon } from 'lucide-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

import { useSyncMessageTemplates } from '../api/message-template-mutations'
import { messageTemplateQueries } from '../api/message-template-queries'
import { CATEGORY_LABELS, rejectionExplanation, STATUS_INFO, type MessageTemplateStatus } from '../model/message-template'

const STATUS_VARIANTS: Partial<Record<MessageTemplateStatus, 'default' | 'secondary' | 'destructive'>> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
}

export function TemplateList() {
  const { data: templates } = useSuspenseQuery(messageTemplateQueries.list())

  if (templates.length === 0) return <p className="text-muted-foreground">No templates yet. Create one to send it to Meta's review.</p>

  return (
    <div className="flex flex-col gap-4">
      <RefreshButton />
      <ul className="flex flex-col gap-4">
        {templates.map((template) => (
          <li key={template.id} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-h4">{template.name}</h3>
              <small>{template.language}</small>
              <Badge variant="outline">{CATEGORY_LABELS[template.category]}</Badge>
              <Badge variant={STATUS_VARIANTS[template.status] ?? 'outline'}>{STATUS_INFO[template.status].label}</Badge>
            </div>
            <p className="text-body-sm text-muted-foreground">{STATUS_INFO[template.status].help}</p>
            {/* Meta moves templates on its own; Marketing is charged differently, so say so */}
            {template.previous_category && template.previous_category !== template.category && (
              <p className="text-body-sm text-muted-foreground">
                Meta moved it from {CATEGORY_LABELS[template.previous_category]} to {CATEGORY_LABELS[template.category]}
                {template.category === 'MARKETING' && ' (charged differently)'}.
              </p>
            )}
            {template.status === 'REJECTED' && template.rejected_reason && (
              <p role="alert" className="text-body-sm text-destructive">
                {rejectionExplanation(template.rejected_reason)}
              </p>
            )}
            <p className="whitespace-pre-wrap">{template.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Meta doesn't send every change (a template deleted while in review): this asks it
function RefreshButton() {
  const syncTemplates = useSyncMessageTemplates()

  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" variant="outline" size="sm" disabled={syncTemplates.isPending} onClick={() => syncTemplates.mutate()}>
        <RefreshCwIcon data-icon="inline-start" aria-hidden="true" />
        {syncTemplates.isPending ? 'Asking Meta…' : 'Refresh from Meta'}
      </Button>
      {syncTemplates.isError && (
        <p role="alert" className="text-body-sm text-destructive">
          {syncTemplates.error.message}
        </p>
      )}
    </div>
  )
}
