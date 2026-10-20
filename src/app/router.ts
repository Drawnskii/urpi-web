import { createRouter } from '@tanstack/react-router'

import { RouteErrorPage } from '@/pages/error/route-error-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'

import { queryClient } from './query-client'
import { routeTree } from './route-tree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // Data freshness is owned by TanStack Query, so the router never caches loader results itself.
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: RouteErrorPage,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
