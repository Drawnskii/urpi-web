import { getCurrentTenantId } from '@/features/tenants'
import { configureHttp } from '@/shared/api'

import { redirectToLogin } from './session'

// Who is calling comes from the session cookie, which the browser sends by itself (same origin
// through the /api proxy). The app adds only the business the user is working in
export function setupHttp() {
  configureHttp({
    getHeaders: (): Record<string, string> => {
      const tenantId = getCurrentTenantId()
      return tenantId ? { 'X-Tenant-ID': tenantId } : {}
    },
    // Streams (EventSource) can't send headers: the business goes in the query string, the cookie by itself
    getStreamParams: () => ({ tenant_id: getCurrentTenantId() }),
    // The session ended (signed out in another tab, or it expired): sign in again, then come back here
    onUnauthorized: () => void redirectToLogin(),
  })
}
