import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { chatDisplayName, chatQueries, MessageComposer, MessageList } from '@/features/chats'
import { Button } from '@/shared/components/ui/button'

const route = getRouteApi('/_app/chats/$chatId')

export function ChatPage() {
  const { chatId } = route.useParams()
  // The chat itself (its client and whether it's closed), loaded with its messages by the route
  const { data: chat } = useSuspenseQuery(chatQueries.detail(chatId))

  return (
    <>
      {/* Below lg one pane at a time (ChatsPage): the way back to the list, and whose chat this is */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 lg:hidden">
        <Button asChild variant="ghost" size="icon-sm">
          <Link to="/chats" aria-label="Back to chats">
            <ArrowLeftIcon aria-hidden="true" />
          </Link>
        </Button>
        <h2 className="truncate text-h4">{chatDisplayName(chat)}</h2>
      </header>
      <MessageList chatId={chatId}>
        {/* Keyed: this page stays mounted between chats, and a draft must never follow to another client */}
        <MessageComposer key={chat.id} chat={chat} />
      </MessageList>
    </>
  )
}
