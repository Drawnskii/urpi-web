import { queryOptions } from '@tanstack/react-query'

import { tenantApi } from './tenant-api'

export const tenantKeys = {
  all: ['tenants'] as const,
  list: () => [...tenantKeys.all, 'list'] as const,
  // The current business's: switching business reloads the page, so no tenant id in the key
  members: () => [...tenantKeys.all, 'members'] as const,
}

export const tenantQueries = {
  list: () => queryOptions({ queryKey: tenantKeys.list(), queryFn: tenantApi.list }),
  members: () => queryOptions({ queryKey: tenantKeys.members(), queryFn: tenantApi.members }),
}
