import { queryOptions } from '@tanstack/react-query'

import { authApi } from './auth-api'

export const authQueries = {
  all: () => ['auth'] as const,
  // The user doesn't change while the page is open (logging out leaves the page), and a 401
  // means "not signed in": retrying would only delay the redirect to sign in
  me: () =>
    queryOptions({ queryKey: [...authQueries.all(), 'me'], queryFn: authApi.me, staleTime: Infinity, retry: false }),
}
