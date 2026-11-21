import { cn } from '@/shared/lib/utils'

import { useRespondingLabel } from '../hooks/use-responding-label'
import { useTeam } from '../hooks/use-team'
import type { Chat } from '../model/chat'
import { authorShortName, messageAuthor } from '../model/message-author'
import { TypingDots } from './typing-dots'

interface ChatPreviewProps {
  chat: Chat
}

// A chat list row's second line: who is responding while someone writes (like WhatsApp's
// "typing…"), else the last message with its author ("You: …", "Ana: …", "Urpi: …"; the client's
// alone). Unread previews stand out
export function ChatPreview({ chat }: ChatPreviewProps) {
  const team = useTeam()
  const responding = useRespondingLabel(chat.id)

  if (responding) {
    return (
      // The replies' color in dark mode: primary is too dim on the dark background for small text
      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-body-sm text-primary dark:text-secondary">
        <span className="truncate">{responding}</span>
        <TypingDots />
      </span>
    )
  }
  const last = chat.last_message
  const author = last && authorShortName(messageAuthor(last, team))
  let preview = 'No messages yet'
  if (last) preview = author ? `${author}: ${last.content}` : last.content

  return (
    <span className={cn('min-w-0 flex-1 truncate text-body-sm', chat.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground')}>
      {preview}
    </span>
  )
}
