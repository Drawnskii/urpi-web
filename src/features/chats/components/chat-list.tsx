import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { formatDateTime, formatListTime } from '@/shared/lib'

import { chatQueries } from '../api/chat-queries'

// Above this the badge says 99+, so a busy chat doesn't widen the row
const UNREAD_SHOWN_MAX = 99

export function ChatList() {
  const { data } = useSuspenseInfiniteQuery(chatQueries.list())
  const chats = data.pages.flatMap((page) => page.chats)

  if (chats.length === 0) return <p className="p-4 text-muted-foreground">No chats yet</p>

  return (
    <ScrollArea className="h-full">
      <ul className="flex flex-col gap-1 p-2">
        {chats.map((chat) => {
          const last = chat.last_message
          const unread = chat.unread_count

          return (
            <li key={chat.id}>
              <Button asChild variant="ghost" className="h-auto w-full justify-start gap-3 py-2">
                <Link to="/chats/$chatId" params={{ chatId: chat.id }} activeProps={{ 'aria-current': 'page' }}>
                  <Avatar>
                    <AvatarFallback>{chat.title.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    {/* The name, and the last message's time at the far right */}
                    <span className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1 truncate font-medium">{chat.title}</span>
                      {/* Only what's not the usual state: handed off or closed */}
                      {chat.status !== 'ACTIVE' && <Badge variant="outline">{chat.status}</Badge>}
                      {last && (
                        <time dateTime={last.created_at} title={formatDateTime(last.created_at)}>
                          {formatListTime(last.created_at)}
                        </time>
                      )}
                    </span>
                    {/* The last message, and how many of the client's are unread */}
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-body-sm text-muted-foreground">
                        {last ? last.content : 'No messages yet'}
                      </span>
                      {unread > 0 && (
                        <Badge className="min-w-5 justify-center px-1.5">
                          {unread > UNREAD_SHOWN_MAX ? `${UNREAD_SHOWN_MAX}+` : unread}
                          <span className="sr-only"> unread</span>
                        </Badge>
                      )}
                    </span>
                  </span>
                </Link>
              </Button>
            </li>
          )
        })}
      </ul>
    </ScrollArea>
  )
}
