import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tenantApi } from '@/features/tenants/api/tenant-api'
import { configureHttp } from '@/shared/api/http-client'

const PIZZA = { tenant_id: 'tenant-1', name: 'Pizza', member_id: 'member-1', role: 'OWNER' }

describe('tenantApi', () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

  beforeEach(() => {
    configureHttp({ getHeaders: () => ({}) })
    fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(PIZZA), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists the user’s businesses with GET /tenants', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([PIZZA]), { status: 200 }))

    expect(await tenantApi.list()).toEqual([PIZZA])
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/tenants$/)
  })

  it('lists the current business’s members with GET /members', async () => {
    const ana = { member_id: 'member-1', first_name: 'Ana', last_name: null }
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([ana]), { status: 200 }))

    expect(await tenantApi.members()).toEqual([ana])
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/members$/)
  })

  it('adds a business with its name and time zone, never an owner', async () => {
    expect(await tenantApi.add({ name: 'Pizza', timezone: 'America/Guayaquil' })).toEqual(PIZZA)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/tenants$/)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Pizza', timezone: 'America/Guayaquil' })
  })
})
