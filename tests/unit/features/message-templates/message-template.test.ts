import { describe, expect, it } from 'vitest'

import {
  checkTemplateDraft,
  hasDraftErrors,
  previewTemplate,
  templateVariables,
  toCreateInput,
  toTemplateName,
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
