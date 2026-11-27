import { describe, expect, it } from 'vitest'

import {
  checkTemplateDraft,
  checkTemplateValues,
  hasDraftErrors,
  hasValueErrors,
  pickerTemplates,
  previewTemplate,
  rejectionExplanation,
  STARTER_TEMPLATES,
  templateVariables,
  toCreateInput,
  toTemplateName,
  type MessageTemplate,
  type MessageTemplateStatus,
} from '@/features/message-templates/model/message-template'

const draft = (body: string, examples: Record<string, string> = {}, name = 'booking_confirmation') => ({
  name,
  body,
  examples,
})

describe('templateVariables', () => {
  it('lists variables in order of first appearance, each once', () => {
    expect(templateVariables('Hola {{client_name}}, el {{date}}. Gracias {{client_name}}.')).toEqual([
      'client_name',
      'date',
    ])
  })

  it('accepts spaces inside the braces, like the backend', () => {
    expect(templateVariables('Hola {{ client_name }}.')).toEqual(['client_name'])
  })

  it('ignores what is not a variable (uppercase, single braces)', () => {
    expect(templateVariables('Hola {{Client}} y {name}.')).toEqual([])
  })
})

describe('previewTemplate', () => {
  it('fills each variable with its example', () => {
    expect(previewTemplate('Hola {{client_name}}, el {{date}}.', { client_name: 'Ana', date: 'lunes' })).toBe(
      'Hola Ana, el lunes.',
    )
  })

  it('keeps a variable without an example as it is', () => {
    expect(previewTemplate('Hola {{client_name}}.', {})).toBe('Hola {{client_name}}.')
  })
})

describe('toTemplateName', () => {
  it('lowercases, turns spaces into _ and drops what Meta refuses', () => {
    expect(toTemplateName('Booking Confirmación 2!')).toBe('booking_confirmacin_2')
  })
})

describe('checkTemplateDraft', () => {
  it('accepts a valid draft with one example per variable', () => {
    expect(hasDraftErrors(checkTemplateDraft(draft('Hola {{client_name}}, gracias.', { client_name: 'Ana' })))).toBe(
      false,
    )
  })

  it('accepts a body without variables and no examples', () => {
    expect(hasDraftErrors(checkTemplateDraft(draft('Gracias por tu visita.')))).toBe(false)
  })

  it('requires a name with only lowercase letters, digits and _', () => {
    expect(checkTemplateDraft(draft('Hola.', {}, '')).name).toBe('Required')
    expect(checkTemplateDraft(draft('Hola.', {}, 'Bad-Name')).name).toBe('Lowercase letters, digits and _ only')
  })

  it('refuses a body that starts or ends with a variable', () => {
    expect(checkTemplateDraft(draft('{{client_name}}, hola.', { client_name: 'Ana' })).body).toBeDefined()
    expect(checkTemplateDraft(draft('Hola {{client_name}}', { client_name: 'Ana' })).body).toBeDefined()
  })

  it('refuses a body over 1024 characters', () => {
    expect(checkTemplateDraft(draft('a'.repeat(1025))).body).toBe('1024 characters at most')
  })

  it('requires an example for each variable', () => {
    expect(checkTemplateDraft(draft('Hola {{client_name}}, el {{date}}.', { client_name: 'Ana' })).examples).toEqual({
      date: 'Required: Meta reviews the template with it',
    })
  })
})

describe('pickerTemplates', () => {
  const template = (name: string, status: MessageTemplateStatus, body = 'Hola.') =>
    ({ name, status, body }) as MessageTemplate
  const templates = [
    template('a_pending', 'PENDING'),
    template('b_approved', 'APPROVED', 'Tu pedido está listo.'),
    template('c_rejected', 'REJECTED'),
    template('d_approved', 'APPROVED'),
  ]
  const names = (search: string) => pickerTemplates(templates, search).map((t) => t.name)

  it('puts the approved ones first, each group in the order it came', () => {
    expect(names('')).toEqual(['b_approved', 'd_approved', 'a_pending', 'c_rejected'])
  })

  it('searches the name and the text, whatever the case', () => {
    expect(names(' PEDIDO ')).toEqual(['b_approved'])
    expect(names('rejected')).toEqual(['c_rejected'])
    expect(names('nada')).toEqual([])
  })
})

describe('checkTemplateValues', () => {
  const template = { body: 'Hola {{name}}, el {{date}}.', variables: ['name', 'date'] }

  it('accepts one value per variable', () => {
    const errors = checkTemplateValues(template, { name: 'Ana', date: 'a    b' })

    expect(errors).toEqual({ variables: {} })
    expect(hasValueErrors(errors)).toBe(false)
  })

  it('names each variable that is missing or that WhatsApp refuses', () => {
    expect(checkTemplateValues(template, { name: '  ', date: 'five     spaces' }).variables).toEqual({
      name: 'Required',
      date: 'No line breaks, tabs or more than 4 spaces in a row',
    })
    expect(checkTemplateValues(template, { name: 'Ana', date: 'two\nlines' }).variables.date).toBeDefined()
  })

  it('refuses a filled message over 1024 characters', () => {
    const errors = checkTemplateValues(template, { name: 'a'.repeat(1020), date: 'lunes' })

    expect(errors.tooLong).toContain('1024')
    expect(hasValueErrors(errors)).toBe(true)
  })
})

describe('rejectionExplanation', () => {
  it("puts Meta's codes in plain words and keeps its sentences", () => {
    expect(rejectionExplanation('PROMOTIONAL')).toContain('Marketing')
    expect(rejectionExplanation('Add text between the variables.')).toBe('Add text between the variables.')
  })
})

describe('STARTER_TEMPLATES', () => {
  it('are all ready to send to review', () => {
    for (const starter of STARTER_TEMPLATES) expect(checkTemplateDraft(starter.draft)).toEqual({})
  })
})

describe('toCreateInput', () => {
  it('trims and keeps exactly the examples of the variables still in the body', () => {
    const input = toCreateInput({
      name: 'reminder',
      language: 'es',
      category: 'UTILITY',
      body: '  Hola {{client_name}}.  ',
      examples: { client_name: ' Ana ', date: 'lunes' },
    })
    expect(input).toEqual({
      name: 'reminder',
      language: 'es',
      category: 'UTILITY',
      body: 'Hola {{client_name}}.',
      examples: { client_name: 'Ana' },
    })
  })
})
