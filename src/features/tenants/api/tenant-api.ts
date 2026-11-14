import { http } from '@/shared/api'

import type { AddTenantInput, UserTenant } from '../model/tenant'

// Named after the backend's use cases: ListUserTenants, AddTenant. No X-Tenant-ID needed:
// these routes are how the user gets one to send
export const tenantApi = {
  // The signed-in user's businesses, oldest first. Empty: they have none yet (onboarding)
  list: () => http<UserTenant[]>('/tenants'),

  // 201: the business, with the user as its OWNER. 409 TenantLimitReachedError: they own the most allowed
  add: (input: AddTenantInput) => http<UserTenant>('/tenants', { method: 'POST', body: input }),
}
