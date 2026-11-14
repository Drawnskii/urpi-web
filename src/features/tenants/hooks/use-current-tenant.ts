import { useSuspenseQuery } from '@tanstack/react-query'

import { tenantQueries } from '../api/tenant-queries'
import { useCurrentTenantId } from '../model/current-tenant-store'
import type { UserTenant } from '../model/tenant'

// The business the user is working in, with their role in it. null while they have none.
// The route guard loaded the list and checked the id, so this never waits
export function useCurrentTenant(): UserTenant | null {
  const tenantId = useCurrentTenantId()
  const { data: tenants } = useSuspenseQuery(tenantQueries.list())
  return tenants.find((tenant) => tenant.tenant_id === tenantId) ?? null
}
