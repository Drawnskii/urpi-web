import { MousePointerClickIcon } from 'lucide-react'

import type { MessageOf } from '../model/chat'

interface InteractiveReplyMessageProps {
  message: MessageOf<'INTERACTIVE'>
}

// The client's tap on a button, a list row or a product: what they chose, marked as a choice so it
// doesn't read like something they typed
export function InteractiveReplyMessage({ message }: InteractiveReplyMessageProps) {
  const { title, description } = message.payload

  return (
    <div className="flex min-w-0 flex-col">
      <span className="flex items-center gap-1 text-caption opacity-70">
        <MousePointerClickIcon aria-hidden="true" className="size-3.5" />
        Selected
      </span>
      <span className="text-body-sm font-medium wrap-anywhere">{title}</span>
      {description && <span className="text-body-sm wrap-anywhere opacity-80">{description}</span>}
    </div>
  )
}
