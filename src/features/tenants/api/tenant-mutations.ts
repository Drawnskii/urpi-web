import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setCurrentTenant } from '../model/current-tenant-store'
import { tenantApi } from './tenant-api'
import { tenantKeys } from './tenant-queries'

// The new business becomes the current one. The list is refetched before isPending ends, so the
// route guard finds it there on the next navigation
export function useAddTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tenantApi.add,
    onSuccess: (tenant) => {
      setCurrentTenant(tenant.tenant_id)
      return queryClient.invalidateQueries({ queryKey: tenantKeys.list() })
    },
  })
}
