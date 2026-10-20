import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '@/shared/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // 4xx answers won't change on retry; network errors and 5xx get one more try
      retry: (failureCount, error) => !(isApiError(error) && error.status < 500) && failureCount < 1,
    },
  },
})
