import { queryOptions } from '@tanstack/react-query'

import { tenantApi } from './tenant-api'

export const tenantKeys = {
  all: ['tenants'] as const,
  list: () => [...tenantKeys.all, 'list'] as const,
}

export const tenantQueries = {
  list: () => queryOptions({ queryKey: tenantKeys.list(), queryFn: tenantApi.list }),
}
