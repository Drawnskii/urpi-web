import { configureHttp } from '@/shared/api'
import { env } from '@/shared/config'

// Until authentication exists, the tenant and the acting member come from env
// (VITE_TENANT_ID, VITE_TENANT_MEMBER_ID). Later: read both from the session,
// for example a Zustand store in features/auth.
export function setupHttp() {
  configureHttp({
    getHeaders: () => {
      const headers: Record<string, string> = {}
      if (env.tenantId) headers['X-Tenant-ID'] = env.tenantId
      if (env.tenantMemberId) headers['X-Tenant-Member-ID'] = env.tenantMemberId
      return headers
    },
  })
}
