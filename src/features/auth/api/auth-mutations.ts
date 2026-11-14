import { useMutation } from '@tanstack/react-query'

import { resetCurrentTenant } from '@/features/tenants'
import { leavePage } from '@/shared/api'

import { authApi } from './auth-api'

// On a shared computer the next person must not land in this one's business: it's forgotten before
// the browser leaves for WorkOS. The cache goes with the page (a full navigation). Clearing it here
// would refetch with the cookie already deleted: an error screen, and 401s sending the browser to
// sign in instead of to WorkOS's logout
export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: ({ logout_url }) => {
      resetCurrentTenant()
      leavePage(logout_url)
    },
  })
}
