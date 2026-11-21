import { http } from '@/shared/api'

import type { AddTenantInput, TenantMember, UserTenant } from '../model/tenant'

// Named after the backend's use cases: ListUserTenants, AddTenant, ListTenantMembers. No
// X-Tenant-ID needed for /tenants: those routes are how the user gets one to send
export const tenantApi = {
  // The current business's members (X-Tenant-ID), oldest first, with their names
  members: () => http<TenantMember[]>('/members'),

  // The signed-in user's businesses, oldest first. Empty: they have none yet (onboarding)
  list: () => http<UserTenant[]>('/tenants'),

  // 201: the business, with the user as its OWNER. 409 TenantLimitReachedError: they own the most allowed
  add: (input: AddTenantInput) => http<UserTenant>('/tenants', { method: 'POST', body: input }),
}
