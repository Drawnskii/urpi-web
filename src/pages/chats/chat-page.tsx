import { getRouteApi } from '@tanstack/react-router'

import { MessageComposer, MessageList } from '@/features/chats'

const route = getRouteApi('/_app/chats/$chatId')

export function ChatPage() {
  const { chatId } = route.useParams()

  return (
    <MessageList chatId={chatId}>
      <MessageComposer chatId={chatId} />
    </MessageList>
  )
}
