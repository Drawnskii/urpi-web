import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, type ReactNode } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { formatDayLabel } from '@/shared/lib'

import { chatQueries } from '../api/chat-queries'
import { useReadReceipts } from '../hooks/use-read-receipts'
import { groupMessagesByDay } from '../model/message-groups'
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
      <ol className="flex flex-1 flex-col gap-3 p-4 empty:hidden">
        {days.map((group) => (
          <li key={group.day} className="flex flex-col gap-3">
            {/* Sticky inside its own day: it stays pinned while that day is on screen and scrolls
                away with the day's end, so the pill always names the day being read. CSS only */}
            <div className="sticky top-2 z-10 flex justify-center">
              <Badge variant="outline" className="bg-background shadow-xs">
                <time dateTime={group.day}>{formatDayLabel(group.messages[0].created_at)}</time>
              </Badge>
            </div>
            <ol className="flex flex-col gap-3">
              {group.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </ol>
          </li>
        ))}
      </ol>
      {/* Sticky at the bottom, so messages pass under the composer's card; the space around the card
          is transparent and lets clicks through. Part of the scrolled content, so the newest
          message rests just above it */}
      <div className="pointer-events-none sticky bottom-0 z-20 [&_*]:pointer-events-auto [&>form]:pointer-events-none">{children}</div>
      <div ref={bottomRef} />
    </ScrollArea>
  )
}
