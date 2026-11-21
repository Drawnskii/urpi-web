import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

import { chatQueries, MessageComposer, MessageList } from '@/features/chats'

const route = getRouteApi('/_app/chats/$chatId')

export function ChatPage() {
  const { chatId } = route.useParams()
  // The chat itself (its client and whether it's closed), loaded with its messages by the route
  const { data: chat } = useSuspenseQuery(chatQueries.detail(chatId))

  return (
    <MessageList chatId={chatId}>
      <MessageComposer chat={chat} />
    </MessageList>
  )
}
