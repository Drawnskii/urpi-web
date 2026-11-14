import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { authApi } from '@/features/auth/api/auth-api'
import { authQueries } from '@/features/auth/api/auth-queries'
import { configureHttp } from '@/shared/api/http-client'

describe('authApi', () => {
  let onUnauthorized: ReturnType<typeof vi.fn<() => void>>
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

  beforeEach(() => {
    onUnauthorized = vi.fn<() => void>()
    configureHttp({ getHeaders: () => ({}), onUnauthorized })
    fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('me: a 401 is the answer "nobody", not a lost session to redirect from', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ detail: 'not signed in', error: 'InvalidSessionError' }), { status: 401 }))

    await expect(authApi.me()).rejects.toMatchObject({ isUnauthorized: true })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('logout: POST /auth/logout, and where the browser goes next', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ logout_url: 'https://api.workos.com/logout' }), { status: 200 }))

    expect(await authApi.logout()).toEqual({ logout_url: 'https://api.workos.com/logout' })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/auth\/logout$/)
    expect(init.method).toBe('POST')
  })
})

describe('authQueries.me', () => {
  it('is fetched once per page load and never retried', () => {
    const options = authQueries.me()

    expect(options.queryKey).toEqual(['auth', 'me'])
    expect(options.staleTime).toBe(Infinity)
    expect(options.retry).toBe(false)
  })
})
