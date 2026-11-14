import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/shared/api/api-error'
import { configureHttp, http, streamUrl } from '@/shared/api/http-client'

function respond(status: number, body?: unknown) {
  return vi.fn<typeof fetch>(async () => new Response(body === undefined ? null : JSON.stringify(body), { status }))
}

describe('http', () => {
  let onUnauthorized: ReturnType<typeof vi.fn<() => void>>

  beforeEach(() => {
    onUnauthorized = vi.fn<() => void>()
    configureHttp({ getHeaders: () => ({ 'X-Tenant-ID': 'tenant-1' }), onUnauthorized })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls onUnauthorized on a 401, then throws the ApiError', async () => {
    vi.stubGlobal('fetch', respond(401, { detail: 'not signed in', error: 'InvalidSessionError' }))

    const call = http('/chats')

    await expect(call).rejects.toMatchObject({ status: 401, code: 'InvalidSessionError' })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('leaves a 401 to the caller when it opts out', async () => {
    vi.stubGlobal('fetch', respond(401, { detail: 'not signed in', error: 'InvalidSessionError' }))

    await expect(http('/auth/me', { skipUnauthorizedHandler: true })).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('never calls onUnauthorized for other errors', async () => {
    vi.stubGlobal('fetch', respond(404, { detail: 'gone', error: 'TenantNotFoundError' }))

    await expect(http('/chats')).rejects.toMatchObject({ status: 404 })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('sends the default headers, and never the option to fetch', async () => {
    const fetchMock = respond(200, [])
    vi.stubGlobal('fetch', fetchMock)

    await http('/auth/me', { skipUnauthorizedHandler: true })

    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.headers).toMatchObject({ 'X-Tenant-ID': 'tenant-1' })
    expect(init).not.toHaveProperty('skipUnauthorizedHandler')
  })
})

describe('streamUrl', () => {
  it('adds the stream params and drops the empty ones', () => {
    configureHttp({ getHeaders: () => ({}), getStreamParams: () => ({ tenant_id: 'tenant-1', member_id: undefined }) })

    expect(streamUrl('/events')).toMatch(/\/events\?tenant_id=tenant-1$/)
  })

  it('has no query string without a business', () => {
    configureHttp({ getHeaders: () => ({}), getStreamParams: () => ({ tenant_id: null }) })

    expect(streamUrl('/events')).toMatch(/\/events$/)
  })
})
