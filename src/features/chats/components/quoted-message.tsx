import type { Message } from '../model/chat'

interface QuotedMessageProps {
  // The message replied to; null when Urpi doesn't have it or it isn't loaded
  quoted: Message | null
}

// Above a reply: one line of the message it answers, like WhatsApp's quote
export function QuotedMessage({ quoted }: QuotedMessageProps) {
  return (
    <blockquote className="min-w-0 border-l-2 border-current/40 pl-2 text-caption opacity-80">
      <p className="truncate">{quoted ? quoted.content : 'Message not available'}</p>
    </blockquote>
  )
}
