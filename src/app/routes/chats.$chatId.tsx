import { createFileRoute } from '@tanstack/react-router'

import { chatQueries } from '@/features/chats'
import { ChatPage } from '@/pages/chats/chat-page'
import { ChatPageSkeleton } from '@/pages/chats/chat-page-skeleton'

export const Route = createFileRoute('/chats/$chatId')({
  loader: ({ context, params }) => context.queryClient.ensureInfiniteQueryData(chatQueries.messages(params.chatId)),
  pendingComponent: ChatPageSkeleton,
  component: ChatPage,
})
