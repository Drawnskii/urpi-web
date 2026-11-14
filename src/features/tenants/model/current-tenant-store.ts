import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

// The business the user is working in, remembered in this browser. Read outside React too:
// src/app/http.ts sends it as X-Tenant-ID, and the route guard checks it against the user's businesses
interface CurrentTenantState {
  tenantId: string | null
  setTenant: (tenantId: string) => void
  reset: () => void
}

// localStorage that never throws. Blocked storage (privacy settings, some private windows) throws
// on every call, and persist only catches it on the first read: then nothing is remembered, nothing
// crashes, and the guard picks the first business on every load
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      // not remembered: still the current business until the page reloads
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      // nothing was remembered
    }
  },
}

const useCurrentTenantStore = create<CurrentTenantState>()(
  persist(
    (set) => ({
      tenantId: null,
      setTenant: (tenantId) => set({ tenantId }),
      reset: () => set({ tenantId: null }),
    }),
    {
      name: 'urpi-current-tenant',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ tenantId: state.tenantId }),
    },
  ),
)

export const useCurrentTenantId = () => useCurrentTenantStore((state) => state.tenantId)

// Outside React (the app's HTTP setup, the route guard, logging out)
export const getCurrentTenantId = () => useCurrentTenantStore.getState().tenantId
export const setCurrentTenant = (tenantId: string) => useCurrentTenantStore.getState().setTenant(tenantId)
export const resetCurrentTenant = () => useCurrentTenantStore.getState().reset()
