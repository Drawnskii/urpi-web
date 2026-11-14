import { createFileRoute } from '@tanstack/react-router'

import { chatQueries } from '@/features/chats'
import { ChatsPage } from '@/pages/chats/chats-page'
import { ChatsPageSkeleton } from '@/pages/chats/chats-page-skeleton'

export const Route = createFileRoute('/_app/chats')({
  loader: ({ context }) => context.queryClient.ensureInfiniteQueryData(chatQueries.list()),
  pendingComponent: ChatsPageSkeleton,
  component: ChatsPage,
})
