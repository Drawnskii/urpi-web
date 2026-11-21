import { createFileRoute } from '@tanstack/react-router'

import { chatQueries } from '@/features/chats'
import { tenantQueries } from '@/features/tenants'
import { ChatsPage } from '@/pages/chats/chats-page'
import { ChatsPageSkeleton } from '@/pages/chats/chats-page-skeleton'

export const Route = createFileRoute('/_app/chats')({
  // The team with the list: the previews and bubbles name who wrote each reply
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureInfiniteQueryData(chatQueries.list()),
      context.queryClient.ensureQueryData(tenantQueries.members()),
    ]),
  pendingComponent: ChatsPageSkeleton,
  component: ChatsPage,
})
