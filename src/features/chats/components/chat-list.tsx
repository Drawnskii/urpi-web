import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { UserIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { formatDateTime, formatListTime } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'

import { chatQueries } from '../api/chat-queries'
import { ChatTitle } from './chat-title'
import { ClientInfoPopover } from './client-info-popover'

// Above this the badge says 99+, so a busy chat doesn't widen the row
const UNREAD_SHOWN_MAX = 99

export function ChatList() {
  const { data } = useSuspenseInfiniteQuery(chatQueries.list())
  const chats = data.pages.flatMap((page) => page.chats)

  if (chats.length === 0) return <p className="p-4 text-muted-foreground">No chats yet</p>

  return (
    // Radix wraps the list in a display: table div that grows to fit its content, so a long preview
    // would push the row past the right edge instead of truncating: block makes it take the list's width
    <ScrollArea className="h-full [&_[data-slot=scroll-area-viewport]>div]:block!">
      <ul className="p-2">
        {chats.map((chat) => {
          const last = chat.last_message
          const unread = chat.unread_count

          return (
            <li key={chat.id}>
              {/* The usual press nudge, except while the name is being edited: clicking in the field
                  would jog it */}
              <Button
                asChild
                variant="ghost"
                className="h-auto w-full justify-start gap-3 py-2 has-[input]:active:not-aria-[haspopup]:translate-y-0"
              >
                {/* Not draggable: dragging to select text in the name field would drag the link instead */}
                <Link
                  to="/chats/$chatId"
                  params={{ chatId: chat.id }}
                  activeProps={{ 'aria-current': 'page' }}
                  draggable={false}
                >
                  <Avatar>
                    {/* WhatsApp doesn't share profile photos: the name's initial, or a person without one */}
                    <AvatarFallback>
                      {chat.client_name ? chat.client_name.charAt(0).toUpperCase() : <UserIcon aria-hidden="true" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    {/* The name takes the room left (cut with …); the time and, at the far right next to
                        it, the info button: at the row's edge, it keeps the same place in every row */}
                    <span className="flex items-center gap-2">
                      <ChatTitle chat={chat} />
                      <span className="flex shrink-0 items-center gap-1.5">
                        {last && (
                          <time dateTime={last.created_at} title={formatDateTime(last.created_at)}>
                            {formatListTime(last.created_at)}
                          </time>
                        )}
                        {/* Who the client is: their name and number, on hover */}
                        <span className="flex size-3.5">
                          {chat.client_phone_number && (
                            <ClientInfoPopover name={chat.client_name} phoneNumber={chat.client_phone_number} />
                          )}
                        </span>
                      </span>
                    </span>
                    {/* The last message, and how many of the client's are unread: unread previews stand out */}
                    <span className="mt-0.5 flex items-center gap-2">
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-body-sm',
                          unread > 0 ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {last ? last.content : 'No messages yet'}
                      </span>
                      {/* Only what's not the usual state: handed off or closed */}
                      {chat.status !== 'ACTIVE' && <Badge variant="outline">{chat.status}</Badge>}
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
