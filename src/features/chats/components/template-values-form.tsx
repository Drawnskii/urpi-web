import { useState, type SubmitEvent } from 'react'

import {
  CATEGORY_LABELS,
  checkTemplateValues,
  hasValueErrors,
  previewTemplate,
  VariableFields,
  type MessageTemplate,
  type TemplateValueErrors,
} from '@/features/message-templates'
import { Button } from '@/shared/components/ui/button'

import { useSendTemplate } from '../api/chat-mutations'
import { MessageBubble } from './message-bubble'

interface TemplateValuesFormProps {
  chatId: string
  template: MessageTemplate // an approved one
  onBack: () => void
  onSent: () => void
}

// One field per variable, the bubble as it will look, and Send
export function TemplateValuesForm({ chatId, template, onBack, onSent }: TemplateValuesFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<TemplateValueErrors>({ variables: {} })
  const sendTemplate = useSendTemplate(chatId)
  const [previewedAt] = useState(() => new Date().toISOString()) // the preview bubble's time

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    // The dialog is a portal, but React still bubbles its events to the composer's own form
    event.stopPropagation()
    const found = checkTemplateValues(template, values)
    setErrors(found)
    if (hasValueErrors(found)) return

    sendTemplate.mutate({ template_id: template.id, values }, { onSuccess: onSent })
  }

  function handleValueChange(variable: string, value: string) {
    setValues((current) => ({ ...current, [variable]: value }))
  }

  const formError = errors.tooLong ?? sendTemplate.error?.message

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col gap-4">
      <p className="text-body-sm">
        <span className="font-medium">{template.name}</span> · {CATEGORY_LABELS[template.category]}
      </p>
      <VariableFields
        idPrefix="template-value"
        variables={template.variables}
        values={values}
        errors={errors.variables}
        placeholders={template.examples}
        onChange={handleValueChange}
      />

      {/* The chat's own bubble, so it looks as it will once sent; a variable not filled yet shows as {{name}} */}
      <ol aria-label="Preview">
        <MessageBubble
          chatId={chatId}
          message={{
            id: 'preview',
            sender_type: 'TENANT_MEMBER',
            sender_tenant_member_id: null,
            content: previewTemplate(template.body, values),
            type: 'TEXT',
            payload: {},
            status: null,
            failure_reason: null,
            failure_code: null,
            created_at: previewedAt,
          }}
        />
      </ol>

      {formError && (
        <p role="alert" className="text-body-sm text-destructive">
          {formError}
        </p>
      )}
      <div className="flex justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={sendTemplate.isPending}>
          Back
        </Button>
        <Button type="submit" disabled={sendTemplate.isPending}>
          {sendTemplate.isPending ? 'Sending…' : 'Send template'}
        </Button>
      </div>
    </form>
  )
}
