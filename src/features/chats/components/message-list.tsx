import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { formatDayLabel } from '@/shared/lib'

import { chatQueries } from '../api/chat-queries'
import { useReadReceipts } from '../hooks/use-read-receipts'
import { groupMessagesByDay } from '../model/message-groups'
import { MessageBubble } from './message-bubble'

interface MessageListProps {
  chatId: string
}

export function MessageList({ chatId }: MessageListProps) {
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

  if (messages.length === 0) return <p className="flex-1 p-4 text-muted-foreground">No messages yet</p>

  return (
    <ScrollArea className="min-h-0 flex-1">
      <ol className="flex flex-col gap-3 p-4">
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
      <div ref={bottomRef} />
    </ScrollArea>
  )
}
