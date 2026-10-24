import type { QueryClient, QueryKey } from '@tanstack/react-query'

// Writes a pushed change into the cache, unless a fetch of that query is in flight: its older
// response would overwrite the patch, so fetch again instead
export function patchOrRefetch<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  patch: (data: T | undefined) => T | undefined,
) {
  if (queryClient.getQueryState(queryKey)?.fetchStatus === 'fetching') {
    void queryClient.invalidateQueries({ queryKey })
    return
  }
  queryClient.setQueryData<T>(queryKey, patch)
}
