import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// leavePage remembers that the page is leaving for as long as the module lives: a fresh one per test
async function loadHttpClient() {
  vi.resetModules()
  return import('@/shared/api/http-client')
}

describe('leavePage', () => {
  let assign: ReturnType<typeof vi.fn<(url: string) => void>>

  beforeEach(() => {
    assign = vi.fn<(url: string) => void>()
    vi.stubGlobal('window', { location: { assign } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('navigates once: the first navigation wins', async () => {
    const { leavePage } = await loadHttpClient()

    expect(leavePage('https://api.workos.com/logout')).toBe(true)
    expect(leavePage('/api/auth/login?return_to=%2Fchats')).toBe(false)

    expect(assign.mock.calls).toEqual([['https://api.workos.com/logout']])
  })

  it('keeps late 401s from redirecting once the page is leaving (logging out deleted the cookie)', async () => {
    const { configureHttp, http, leavePage } = await loadHttpClient()
    const onUnauthorized = vi.fn<() => void>()
    configureHttp({ getHeaders: () => ({}), onUnauthorized })
    vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ detail: 'not signed in' }), { status: 401 })))

    leavePage('https://api.workos.com/logout')

    await expect(http('/chats')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})
