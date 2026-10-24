import { getRouteApi } from '@tanstack/react-router'

import { MessageComposer, MessageList } from '@/features/chats'

const route = getRouteApi('/chats/$chatId')

export function ChatPage() {
  const { chatId } = route.useParams()

  return (
    <>
      <MessageList chatId={chatId} />
      <MessageComposer chatId={chatId} />
    </>
  )
}
