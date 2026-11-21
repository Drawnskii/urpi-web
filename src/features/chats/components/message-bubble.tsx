import { CheckCheckIcon, CheckIcon, CircleAlertIcon, ClockIcon, type LucideIcon } from 'lucide-react'

import { formatDateTime, formatTime } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'

import type { Message, MessageStatus } from '../model/chat'
import { MessageBody } from './message-body'
import { QuotedMessage } from './quoted-message'

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
  chatId: string // the message's chat: its files are reached through it
  message: Message
  // Follows a message from the same side: the corner it touches is squared too, chaining the run
  isContinued?: boolean
  // Under the bubble, outside it (a short message's bubble has no room): "Ana García", "Urpi".
  // Only on the last of an author's messages, never on the signed-in member's
  author?: string | null
  // The client's reaction to this message (an emoji), shown on its corner
  reaction?: string
  // The message this one replies to: undefined when it's not a reply, null when Urpi doesn't have it
  quoted?: Message | null
}

// One message: client messages on the left, the agent's and members' on the right
export function MessageBubble({ chatId, message, isContinued = false, author = null, reaction, quoted }: MessageBubbleProps) {
  const isClient = message.sender_type === 'CLIENT'
  // Client messages have no status (they're incoming)
  const status = message.status ? STATUS_ICONS[message.status] : null

  return (
    <li className={cn('flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]', isClient ? 'self-start' : 'self-end items-end')}>
      {/* The bottom corner nearest its side squared off, like a tail; a continued message squares its
          top one too, so a run of messages reads as one chain */}
      <div
        className={cn(
          'relative flex min-w-0 flex-col gap-1 rounded-xl px-3 py-2',
          isClient ? 'rounded-bl-sm bg-accent text-accent-foreground' : 'rounded-br-sm bg-secondary text-secondary-foreground',
          isContinued && (isClient ? 'rounded-tl-sm' : 'rounded-tr-sm'),
          reaction && 'mb-3',
        )}
      >
        {quoted !== undefined && <QuotedMessage quoted={quoted} />}
        <MessageBody chatId={chatId} message={message} />
        {/* WhatsApp's place for it: over the bottom edge, on the side away from the tail */}
        {reaction && (
          <span
            className={cn(
              'absolute -bottom-3 rounded-full border bg-background px-1.5 text-body-sm leading-5 shadow-xs',
              isClient ? 'right-2' : 'left-2',
            )}
          >
            <span className="sr-only">Reaction: </span>
            {reaction}
          </span>
        )}
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
