import { usePrefetchQuery, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { CATEGORY_LABELS, messageTemplateQueries, pickerTemplates, STATUS_INFO } from '@/features/message-templates'
import { PaymentMethodCard, whatsAppConnectionQueries } from '@/features/whatsapp-connection'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

import { TemplateValuesForm } from './template-values-form'

interface TemplatePickerProps {
  chatId: string
  onSent: () => void
}

// While the business can't send templates, why instead of them. A number that can't be read leaves
// them: the server still refuses what mustn't go
export function TemplatePicker(props: TemplatePickerProps) {
  const connection = useQuery(whatsAppConnectionQueries.detail())
  usePrefetchQuery(messageTemplateQueries.list()) // alongside the number, not after it

  if (connection.isPending) return <LoadingTemplates />

  const number = connection.data?.status === 'ACTIVE' ? connection.data : null
  const isOff = number !== null && !number.templates_enabled
  // Staff turned them on without a payment method: the templates are what's wanted here, not the card
  const isOnWithoutCard = number !== null && number.templates_enabled && !number.payment_method_ready

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* Stays in place when the templates come back, so it can confirm what its check found */}
      {!isOnWithoutCard && <PaymentMethodCard />}
      {!isOff && <TemplateChoice {...props} />}
      {isOff && number.payment_method_ready && (
        <p className="text-body-sm text-muted-foreground">
          Sending templates is turned off for your business. Contact Urpi to turn it on.
        </p>
      )}
    </div>
  )
}

function LoadingTemplates() {
  return <p className="text-body-sm text-muted-foreground">Loading templates…</p>
}

// Choose a template (approved ones first; the others show why they can't go), then fill it
function TemplateChoice({ chatId, onSent }: TemplatePickerProps) {
  const { data: templates, error } = useQuery(messageTemplateQueries.list())
  const [search, setSearch] = useState('')
  const [chosenId, setChosenId] = useState<string>()
  // Read from the list, which stays live: one Meta stops approving meanwhile goes back to it
  const chosen = templates?.find((template) => template.id === chosenId && template.status === 'APPROVED')

  if (chosen) {
    return <TemplateValuesForm chatId={chatId} template={chosen} onBack={() => setChosenId(undefined)} onSent={onSent} />
  }
  if (error) {
    return (
      <p role="alert" className="text-body-sm text-destructive">
        {error.message}
      </p>
    )
  }
  if (!templates) return <LoadingTemplates />
  if (templates.length === 0) {
    return (
      <p className="text-body-sm text-muted-foreground">
        No templates yet. <Link to="/templates">Create one</Link> and send it once Meta approves it.
      </p>
    )
  }

  const found = pickerTemplates(templates, search)

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search templates"
        aria-label="Search templates"
      />
      {found.length === 0 && <p className="text-body-sm text-muted-foreground">No template matches</p>}
      <ul className="flex flex-col gap-2">
        {found.map((template) => (
          <li key={template.id}>
            {/* A card-shaped Button: its focus ring and disabled look, with the text stacked and wrapping */}
            <Button
              type="button"
              variant="outline"
              disabled={template.status !== 'APPROVED'}
              onClick={() => setChosenId(template.id)}
              className="h-auto w-full flex-col items-stretch gap-1 p-2 text-left font-normal whitespace-normal"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 truncate font-medium">{template.name}</span>
                <small>{template.language}</small>
                <Badge variant="outline">{CATEGORY_LABELS[template.category]}</Badge>
                {template.status !== 'APPROVED' && <Badge variant="secondary">{STATUS_INFO[template.status].label}</Badge>}
              </span>
              <span className="line-clamp-2 text-body-sm text-muted-foreground">{template.body}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
