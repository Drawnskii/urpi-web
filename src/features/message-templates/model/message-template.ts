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

export const CATEGORY_LABELS: Record<MessageTemplate['category'], string> = {
  UTILITY: 'Utility',
  MARKETING: 'Marketing',
  AUTHENTICATION: 'Authentication',
}

// Each review state in plain words: its name and what the tenant can do with the template
export const STATUS_INFO: Record<MessageTemplateStatus, { label: string; help: string }> = {
  PENDING: { label: 'In review', help: "Meta is checking it, usually within a day. It can't be sent yet." },
  APPROVED: { label: 'Approved', help: 'Ready to send.' },
  REJECTED: { label: 'Rejected', help: "Meta didn't accept it. Fix the problem and send a new one with another name." },
  PAUSED: { label: 'Paused', help: 'Clients blocked or reported it, so Meta paused it for a while. It comes back on its own.' },
  DISABLED: { label: 'Disabled', help: "Meta turned it off after repeated complaints or a policy problem. It can't be sent." },
  IN_APPEAL: { label: 'In appeal', help: "Meta is looking at the appeal. It can't be sent meanwhile." },
  ARCHIVED: { label: 'Archived', help: 'Unused for a long time. Restore it in WhatsApp Manager, or Meta deletes it.' },
  DELETED: { label: 'Deleted', help: 'No longer at Meta.' },
}

// Meta's rejection codes. Webhooks often bring a sentence instead, which shows as it is
const REJECTION_REASONS: Record<string, string> = {
  INVALID_FORMAT: "The text breaks Meta's format rules, for example two variables with nothing between them.",
  INCORRECT_CATEGORY: "The category doesn't match the text: anything promotional is Marketing.",
  PROMOTIONAL: 'It reads as a promotion: send it as Marketing.',
  TAG_CONTENT_MISMATCH: "The category or language doesn't match the text.",
  ABUSIVE_CONTENT: 'Meta found content it considers abusive.',
  SCAM: 'Meta found content it considers a scam.',
  CATEGORY_NOT_AVAILABLE: "This category isn't available to your account.",
}

export function rejectionExplanation(reason: string) {
  return REJECTION_REASONS[reason] ?? reason
}

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

const TEMPLATE_NAME_MAX_LENGTH = 512
export const TEMPLATE_BODY_MAX_LENGTH = 1024
const TEMPLATE_EXAMPLE_MAX_LENGTH = 200

// The backend's TEMPLATE_NAME_PATTERN, TEMPLATE_VARIABLE_PATTERN and TEMPLATE_VALUE_FORBIDDEN
const NAME_PATTERN = /^[a-z0-9_]+$/
const VARIABLE_PATTERN = /\{\{\s*([a-z0-9_]+)\s*\}\}/g
const VALUE_FORBIDDEN_PATTERN = /[\n\r\t]| {5}/

// The body's variables, in order of first appearance, each once (the backend's variables_of)
export function templateVariables(body: string) {
  return [...new Set(Array.from(body.matchAll(VARIABLE_PATTERN), (match) => match[1]))]
}

// The body with each variable replaced by its value (the form's examples, or what a member typed);
// a variable without one stays as {{name}}
export function previewTemplate(body: string, values: Record<string, string>) {
  return body.replace(VARIABLE_PATTERN, (variable, name: string) => values[name]?.trim() || variable)
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

// The picker's list: those whose name or text has the search, the sendable (approved) ones first,
// the rest in the order they came
export function pickerTemplates(templates: MessageTemplate[], search: string) {
  const wanted = search.trim().toLowerCase()
  const found = templates.filter((template) => `${template.name} ${template.body}`.toLowerCase().includes(wanted))
  return found.sort((a, b) => Number(b.status === 'APPROVED') - Number(a.status === 'APPROVED'))
}

export type TemplateValueErrors = {
  variables: Record<string, string> // by variable
  tooLong?: string                  // about the whole message
}

// The backend's MessageTemplateEntity.fill, as messages. No variables' errors and no tooLong: ready to send
export function checkTemplateValues(
  template: Pick<MessageTemplate, 'body' | 'variables'>,
  values: Record<string, string>,
): TemplateValueErrors {
  const variables: Record<string, string> = {}
  for (const variable of template.variables) {
    const value = values[variable]?.trim() ?? ''
    if (!value) variables[variable] = 'Required'
    else if (VALUE_FORBIDDEN_PATTERN.test(value)) variables[variable] = 'No line breaks, tabs or more than 4 spaces in a row'
  }
  if (previewTemplate(template.body, values).length <= TEMPLATE_BODY_MAX_LENGTH) return { variables }
  return { variables, tooLong: `The message is over ${TEMPLATE_BODY_MAX_LENGTH} characters: shorten the values` }
}

export function hasValueErrors(errors: TemplateValueErrors) {
  return Boolean(errors.tooLong) || Object.keys(errors.variables).length > 0
}

// Drafts to start from, in the clients' language. Utility ones are about something the client did,
// or Meta moves them to Marketing
export const STARTER_TEMPLATES: { label: string; draft: CreateMessageTemplateInput }[] = [
  {
    label: 'Appointment reminder',
    draft: {
      name: 'recordatorio_cita',
      language: 'es',
      category: 'UTILITY',
      body: 'Hola {{nombre}}, te recordamos tu cita el {{fecha}} a las {{hora}}. Si necesitas cambiarla, responde a este mensaje.',
      examples: { nombre: 'Ana', fecha: 'lunes 12', hora: '10:00' },
    },
  },
  {
    label: 'Order ready',
    draft: {
      name: 'pedido_listo',
      language: 'es',
      category: 'UTILITY',
      body: 'Hola {{nombre}}, tu pedido {{pedido}} está listo. Responde a este mensaje para coordinar la entrega.',
      examples: { nombre: 'Ana', pedido: '1024' },
    },
  },
  {
    label: 'Follow-up after a quote',
    draft: {
      name: 'seguimiento_cotizacion',
      language: 'es',
      category: 'MARKETING',
      body: 'Hola {{nombre}}, ¿pudiste revisar la cotización de {{servicio}}? Responde a este mensaje si tienes alguna pregunta.',
      examples: { nombre: 'Ana', servicio: 'la instalación' },
    },
  },
]

// The input the backend expects: trimmed, with exactly the body's variables as examples
export function toCreateInput(draft: CreateMessageTemplateInput): CreateMessageTemplateInput {
  const body = draft.body.trim()
  const examples = Object.fromEntries(
    templateVariables(body).map((variable) => [variable, draft.examples[variable]?.trim() ?? '']),
  )
  return { ...draft, body, examples }
}
