// Mirrors app/modules/tenant/api/schemas.py and the rules of MessageTemplateEntity.check_draft
// (app/modules/tenant/domain/entities.py): the form checks what the backend would refuse

export type MessageTemplateCategory = 'UTILITY' | 'MARKETING' // AUTHENTICATION: Urpi doesn't create these

export type MessageTemplateStatus =
  | 'PENDING'   // in Meta's review
  | 'APPROVED'  // the only status that sends
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED'
  | 'IN_APPEAL'
  | 'ARCHIVED'
  | 'DELETED'

export interface MessageTemplate {
  id: string
  channel: string                 // WHATSAPP
  name: string
  language: string                // Meta's code: es, es_MX, en_US
  category: MessageTemplateCategory | 'AUTHENTICATION'
  previous_category: MessageTemplate['category'] | null // before Meta last moved it; null: never moved
  status: MessageTemplateStatus
  rejected_reason: string | null  // REJECTED only, in Meta's words
  body: string
  variables: string[]
  examples: Record<string, string>
  created_at: string
}

// Mirrors CreateMessageTemplateIn. Creating it submits it: at Meta it's PENDING at once
export interface CreateMessageTemplateInput {
  name: string
  language: string
  category: MessageTemplateCategory
  body: string
  examples: Record<string, string> // exactly one per variable, for Meta's reviewer
}

export const TEMPLATE_NAME_MAX_LENGTH = 512
export const TEMPLATE_BODY_MAX_LENGTH = 1024
export const TEMPLATE_EXAMPLE_MAX_LENGTH = 200

// The backend's TEMPLATE_NAME_PATTERN and TEMPLATE_VARIABLE_PATTERN
const NAME_PATTERN = /^[a-z0-9_]+$/
const VARIABLE_PATTERN = /\{\{\s*([a-z0-9_]+)\s*\}\}/g

// The body's variables, in order of first appearance, each once (the backend's variables_of)
export function templateVariables(body: string) {
  return [...new Set(Array.from(body.matchAll(VARIABLE_PATTERN), (match) => match[1]))]
}

// The body with each variable replaced by its example; a variable without one stays as {{name}}
export function previewTemplate(body: string, examples: Record<string, string>) {
  return body.replace(VARIABLE_PATTERN, (variable, name: string) => examples[name]?.trim() || variable)
}

// What the tenant types, as a valid name: lowercase, spaces as _, nothing else Meta refuses
export function toTemplateName(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, TEMPLATE_NAME_MAX_LENGTH)
}

export type TemplateDraftErrors = {
  name?: string
  body?: string
  examples?: Record<string, string> // by variable
}

// The backend's check_draft, as messages per field. Empty: ready to submit
export function checkTemplateDraft(draft: Pick<CreateMessageTemplateInput, 'name' | 'body' | 'examples'>) {
  const errors: TemplateDraftErrors = {}

  if (!draft.name) errors.name = 'Required'
  else if (!NAME_PATTERN.test(draft.name)) errors.name = 'Lowercase letters, digits and _ only'
  else if (draft.name.length > TEMPLATE_NAME_MAX_LENGTH) errors.name = `${TEMPLATE_NAME_MAX_LENGTH} characters at most`

  const body = draft.body.trim()
  if (!body) errors.body = 'Required'
  else if (body.length > TEMPLATE_BODY_MAX_LENGTH) errors.body = `${TEMPLATE_BODY_MAX_LENGTH} characters at most`
  else if (body.startsWith('{{') || body.endsWith('}}')) errors.body = "It can't start or end with a variable"

  const exampleErrors: Record<string, string> = {}
  for (const variable of templateVariables(body)) {
    const example = draft.examples[variable]?.trim() ?? ''
    if (!example) exampleErrors[variable] = 'Required: Meta reviews the template with it'
    else if (example.length > TEMPLATE_EXAMPLE_MAX_LENGTH) exampleErrors[variable] = `${TEMPLATE_EXAMPLE_MAX_LENGTH} characters at most`
  }
  if (Object.keys(exampleErrors).length > 0) errors.examples = exampleErrors

  return errors
}

export function hasDraftErrors(errors: TemplateDraftErrors) {
  return Boolean(errors.name || errors.body || errors.examples)
}

// The input the backend expects: trimmed, with exactly the body's variables as examples
export function toCreateInput(draft: CreateMessageTemplateInput): CreateMessageTemplateInput {
  const body = draft.body.trim()
  const examples = Object.fromEntries(
    templateVariables(body).map((variable) => [variable, draft.examples[variable]?.trim() ?? '']),
  )
  return { ...draft, body, examples }
}
