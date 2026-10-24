import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'

import { chatQueries } from '../api/chat-queries'

interface MessageListProps {
  chatId: string
}

export function MessageList({ chatId }: MessageListProps) {
  const { data } = useSuspenseInfiniteQuery(chatQueries.messages(chatId))
  
  const bottomRef = useRef<HTMLDivElement>(null)

  // The API sends newest first; a chat reads oldest at the top
  const messages = data.pages.flatMap((page) => page.messages).reverse()
  const lastMessageId = messages.at(-1)?.id

  // Keep the newest message in view when the chat opens or a message arrives
  useEffect(() => {
    if (lastMessageId) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lastMessageId])

  if (messages.length === 0) return <p className="flex-1">No messages yet</p>

  return (
    <ScrollArea className="min-h-0 flex-1">
      <ol className="flex flex-col gap-3 p-4">
        {messages.map((message) => (
          // Client messages on the left; the agent's and members' on the right
          <li
            key={message.id}
            className={cn('flex max-w-[75%] flex-col gap-1', message.sender_type === 'CLIENT' ? 'self-start' : 'self-end items-end')}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <div className="flex items-center gap-2">
              <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time>
              {message.status && (
                <Badge variant={message.status === 'FAILED' ? 'destructive' : 'secondary'}>{message.status}</Badge>
              )}
            </div>
            {message.failure_reason && <p role="alert">{message.failure_reason}</p>}
          </li>
        ))}
      </ol>
      <div ref={bottomRef} />
    </ScrollArea>
  )
}
