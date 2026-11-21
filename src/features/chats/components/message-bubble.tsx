import { CheckCheckIcon, CheckIcon, CircleAlertIcon, ClockIcon, type LucideIcon } from 'lucide-react'

import { formatDateTime, formatTime } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'

import type { Message, MessageStatus } from '../model/chat'

// WhatsApp's ticks: the clock until it's sent, one tick sent, two delivered, two in primary read
const STATUS_ICONS: Record<MessageStatus, { icon: LucideIcon; label: string; className?: string }> = {
  PENDING: { icon: ClockIcon, label: 'Pending' },
  SENDING: { icon: ClockIcon, label: 'Sending' },
  SENT: { icon: CheckIcon, label: 'Sent' },
  DELIVERED: { icon: CheckCheckIcon, label: 'Delivered' },
  READ: { icon: CheckCheckIcon, label: 'Read', className: 'text-read' },
  FAILED: { icon: CircleAlertIcon, label: 'Failed', className: 'text-destructive' },
}

interface MessageBubbleProps {
  message: Message
  // Follows a message from the same side: the corner it touches is squared too, chaining the run
  isContinued?: boolean
  // Under the bubble, outside it (a short message's bubble has no room): "Ana García", "Urpi".
  // Only on the last of an author's messages, never on the signed-in member's
  author?: string | null
}

// One message: client messages on the left, the agent's and members' on the right
export function MessageBubble({ message, isContinued = false, author = null }: MessageBubbleProps) {
  const isClient = message.sender_type === 'CLIENT'
  // Client messages have no status (they're incoming)
  const status = message.status ? STATUS_ICONS[message.status] : null

  return (
    <li className={cn('flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]', isClient ? 'self-start' : 'self-end items-end')}>
      {/* The bottom corner nearest its side squared off, like a tail; a continued message squares its
          top one too, so a run of messages reads as one chain */}
      <div
        className={cn(
          'flex flex-col gap-1 rounded-xl px-3 py-2',
          isClient ? 'rounded-bl-sm bg-accent text-accent-foreground' : 'rounded-br-sm bg-secondary text-secondary-foreground',
          isContinued && (isClient ? 'rounded-tl-sm' : 'rounded-tr-sm'),
        )}
      >
        {/* wrap-anywhere: a long word or link with no spaces wraps inside the bubble instead of
            widening it past 75% and pushing the page sideways */}
        <p className="text-body-sm whitespace-pre-wrap wrap-anywhere">{message.content}</p>
        <div className="flex items-center justify-end gap-1 opacity-80">
          <time dateTime={message.created_at} title={formatDateTime(message.created_at)}>
            {formatTime(message.created_at)}
          </time>
          {status && (
            <span title={status.label} className={cn('flex', status.className)}>
              <status.icon aria-hidden="true" className="size-4" />
              <span className="sr-only">{status.label}</span>
            </span>
          )}
        </div>
      </div>
      {message.failure_reason && (
        <p role="alert" className="text-body-sm text-destructive">
          {message.failure_reason}
        </p>
      )}
      {author && <span className="px-1 text-caption text-muted-foreground">{author}</span>}
    </li>
  )
}
