import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { upsertTemplate } from '@/features/message-templates/api/message-template-cache'
import { templateLiveEvents } from '@/features/message-templates/api/message-template-events'
import type { MessageTemplate, MessageTemplateStatus } from '@/features/message-templates/model/message-template'

const LIST_KEY = ['message-templates', 'list']

function template(id: string, name: string, status: MessageTemplateStatus = 'PENDING', language = 'es'): MessageTemplate {
  return {
    id,
    channel: 'WHATSAPP',
    name,
    language,
    category: 'UTILITY',
    previous_category: null,
    status,
    rejected_reason: null,
    body: 'Hola {{client_name}}.',
    variables: ['client_name'],
    examples: { client_name: 'Ana' },
    created_at: '2026-10-24T21:09:51Z',
  }
}

describe('upsertTemplate', () => {
  it('leaves an unloaded list unloaded', () => {
    expect(upsertTemplate(undefined, template('t1', 'a'))).toBeUndefined()
  })

  it('replaces a template by id', () => {
    const result = upsertTemplate([template('t1', 'a')], template('t1', 'a', 'APPROVED'))
    expect(result?.map((t) => [t.id, t.status])).toEqual([['t1', 'APPROVED']])
  })

  it('adds a new one in the backend order: name, then language', () => {
    const byName = upsertTemplate([template('t1', 'alpha'), template('t3', 'gamma')], template('t2', 'beta'))
    expect(byName?.map((t) => t.name)).toEqual(['alpha', 'beta', 'gamma'])

    const byLanguage = upsertTemplate([template('t1', 'a', 'PENDING', 'es')], template('t2', 'a', 'PENDING', 'en_US'))
    expect(byLanguage?.map((t) => t.language)).toEqual(['en_US', 'es'])
  })
})

describe('templateLiveEvents', () => {
  it('writes a reviewed template into the list, no request', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(LIST_KEY, [template('t1', 'urpi_prueba')])

    templateLiveEvents(queryClient).events['template.updated'](template('t1', 'urpi_prueba', 'APPROVED'))

    expect(queryClient.getQueryData<MessageTemplate[]>(LIST_KEY)?.[0].status).toBe('APPROVED')
  })

  it('writes a re-categorized template with what it was before', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(LIST_KEY, [template('t1', 'promo', 'APPROVED')])

    templateLiveEvents(queryClient).events['template.updated']({
      ...template('t1', 'promo', 'APPROVED'),
      category: 'MARKETING',
      previous_category: 'UTILITY',
    })

    const [stored] = queryClient.getQueryData<MessageTemplate[]>(LIST_KEY) ?? []
    expect([stored.category, stored.previous_category]).toEqual(['MARKETING', 'UTILITY'])
  })

  it('needs nothing on reconnect: the server replays the templates that changed', () => {
    expect(templateLiveEvents(new QueryClient()).onReconnect).toBeUndefined()
  })
})
