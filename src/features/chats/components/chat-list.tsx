import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

import { chatQueries } from '../api/chat-queries'

export function ChatList() {
  const { data } = useSuspenseInfiniteQuery(chatQueries.list())
  const chats = data.pages.flatMap((page) => page.chats)

  if (chats.length === 0) return <p className="p-4 text-muted-foreground">No chats yet</p>

  return (
    <ScrollArea className="h-full">
      <ul className="flex flex-col gap-1 p-2">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Button asChild variant="ghost" className="h-auto w-full justify-start gap-3 py-2">
              <Link to="/chats/$chatId" params={{ chatId: chat.id }} activeProps={{ 'aria-current': 'page' }}>
                <Avatar>
                  <AvatarFallback>{chat.title.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-left">{chat.title}</span>
                <Badge variant="outline">{chat.status}</Badge>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
