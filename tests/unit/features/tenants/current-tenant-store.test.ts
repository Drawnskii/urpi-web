import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The store reads storage when its module loads: each test stubs localStorage, then imports it fresh
async function loadStore() {
  vi.resetModules()
  return import('@/features/tenants/model/current-tenant-store')
}

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial))
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  }
}

describe('current tenant store', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {}) // persist warns when storage fails
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('remembers the business in this browser, and only its id', async () => {
    const storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
    const store = await loadStore()

    store.setCurrentTenant('tenant-1')

    expect(store.getCurrentTenantId()).toBe('tenant-1')
    expect(JSON.parse(storage.items.get('urpi-current-tenant') ?? '{}').state).toEqual({ tenantId: 'tenant-1' })
  })

  it('starts from the remembered business', async () => {
    vi.stubGlobal('localStorage', memoryStorage({ 'urpi-current-tenant': JSON.stringify({ state: { tenantId: 'tenant-2' }, version: 0 }) }))
    const store = await loadStore()

    expect(store.getCurrentTenantId()).toBe('tenant-2')
  })

  it('forgets it on reset (logging out)', async () => {
    vi.stubGlobal('localStorage', memoryStorage())
    const store = await loadStore()
    store.setCurrentTenant('tenant-1')

    store.resetCurrentTenant()

    expect(store.getCurrentTenantId()).toBeNull()
  })

  it('still works when storage throws (a private window, blocked storage)', async () => {
    const fail = () => {
      throw new DOMException('denied', 'SecurityError')
    }
    vi.stubGlobal('localStorage', { getItem: fail, setItem: fail, removeItem: fail })
    const store = await loadStore()

    store.setCurrentTenant('tenant-1')

    expect(store.getCurrentTenantId()).toBe('tenant-1')
  })
})
