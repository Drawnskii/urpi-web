import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, type ReactNode } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { formatDayLabel } from '@/shared/lib'

import { chatQueries } from '../api/chat-queries'
import { useReadReceipts } from '../hooks/use-read-receipts'
import { groupMessagesByDay, groupMessagesBySide } from '../model/message-groups'
import { MessageBubble } from './message-bubble'

interface MessageListProps {
  chatId: string
  // The composer: pinned to the bottom of the scroll area, so messages scroll under its card
  children?: ReactNode
}

export function MessageList({ chatId, children }: MessageListProps) {
  const { data } = useSuspenseInfiniteQuery(chatQueries.messages(chatId))
  useReadReceipts(chatId)

  const bottomRef = useRef<HTMLDivElement>(null)

  // The API sends newest first; a chat reads oldest at the top. Grouped after flattening, so a
  // day split across two loaded pages is still one group
  const messages = data.pages.flatMap((page) => page.messages).reverse()
  const days = groupMessagesByDay(messages)
  const lastMessageId = messages.at(-1)?.id

  // Keep the newest message in view when the chat opens or a message arrives
  useEffect(() => {
    if (lastMessageId) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lastMessageId])

  return (
    // Radix wraps the content in a display: table div; as a full-height flex column instead, the
    // list fills the space and the footer sits at the bottom even with few messages
    <ScrollArea className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:flex! [&_[data-slot=scroll-area-viewport]>div]:min-h-full [&_[data-slot=scroll-area-viewport]>div]:flex-col">
      {messages.length === 0 && <p className="flex-1 p-4 text-muted-foreground">No messages yet</p>}
      <ol className="flex-1 px-4 pb-4 pt-2 empty:hidden">
        {days.map((group) => (
          // gap-3 under the badge: the first message sits as far from it as a new turn does
          <li key={group.day} className="flex flex-col gap-3 not-first:pt-2">
            {/* Sticky inside its own day: it stays pinned while that day is on screen and scrolls
                away with the day's end, so the pill always names the day being read. CSS only */}
            <div className="sticky top-2 z-10 flex justify-center">
              <Badge variant="outline" className="bg-background shadow-xs">
                <time dateTime={group.day}>{formatDayLabel(group.messages[0].created_at)}</time>
              </Badge>
            </div>
            {/* One run per turn: runs further apart than the list's gap-1, a run's bubbles gap-1 apart */}
            <ol className="gap-3">
              {groupMessagesBySide(group.messages).map((run) => (
                <li key={run.messages[0].id}>
                  <ol>
                    {run.messages.map((message, index) => (
                      <MessageBubble key={message.id} message={message} isContinued={index > 0} />
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
      {/* Sticky at the bottom, so messages pass under the composer's card; the space around the card
          is transparent and lets clicks through. Part of the scrolled content, so the newest
          message rests just above it */}
      <div className="pointer-events-none sticky bottom-0 z-20 **:pointer-events-auto [&>form]:pointer-events-none bg-linear-to-t from-background via-background/80 to-transparent">{children}</div>
      <div ref={bottomRef} />
    </ScrollArea>
  )
}
