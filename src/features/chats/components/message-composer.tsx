import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowUpIcon, ChevronDownIcon, ClockIcon, Undo2Icon } from 'lucide-react'
import { useState, type ChangeEvent, type KeyboardEvent, type ReactNode, type SubmitEvent } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { formatDateTime } from '@/shared/lib'

import { useAddMessage } from '../api/chat-mutations'
import { chatQueries } from '../api/chat-queries'
import { useServiceWindow } from '../hooks/use-service-window'
import { useTypingIndicator } from '../hooks/use-typing-indicator'
import type { Chat } from '../model/chat'
import { ClientChatsPicker } from './client-chats-picker'
import { SendTemplateDialog } from './send-template-dialog'

// One card for the text and its actions; it shows the focus ring the textarea gives up
const CARD_CLASS =
  'flex flex-col gap-1 rounded-xl border border-input bg-card p-2 shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50'

interface MessageComposerProps {
  chat: Chat
}

// A text box only while free text can go: a closed chat can't be answered, and outside the client's
// service window only a template reaches them. The card says which instead.
// Key it by chat.id: its draft and errors belong to one client
export function MessageComposer({ chat }: MessageComposerProps) {
  // Held here, so it's still there if the window closes and the client writes again
  const [content, setContent] = useState('')
  const minutesLeft = useServiceWindow(chat.window_expires_at)

  if (chat.status === 'CLOSED') return <ClosedChatNotice chat={chat} />
  if (minutesLeft === 0) return <ClosedWindowNotice chat={chat} />
  return <OpenChatComposer chat={chat} minutesLeft={minutesLeft} content={content} onContentChange={setContent} />
}

interface OpenChatComposerProps extends MessageComposerProps {
  minutesLeft: number | null // in the window's last hour; null before it
  content: string
  onContentChange: (content: string) => void
}

function OpenChatComposer({ chat, minutesLeft, content, onContentChange }: OpenChatComposerProps) {
  const chatId = chat.id
  const addMessage = useAddMessage(chatId)
  const typing = useTypingIndicator(chatId)

  function send() {
    if (!content.trim()) return
    // The message shows at once (optimistic); if the send fails, it's removed and the text comes back
    addMessage.mutate({ content }, { onError: () => onContentChange(content) })
    onContentChange('')
    typing.reset()
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    send()
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onContentChange(event.target.value)
    if (event.target.value.trim()) typing.notifyTyping()
  }

  // Enter sends; Shift+Enter adds a new line
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4">
      <div className={CARD_CLASS}>
        {minutesLeft !== null && (
          <p className="flex items-center gap-1.5 px-2 pt-1 text-body-sm text-muted-foreground">
            <ClockIcon aria-hidden="true" className="size-4 shrink-0" />
            Window closes in {minutesLeft} min
          </p>
        )}
        {/* Grows with the text (shadcn's field-sizing-content, CSS only) up to 200px, then scrolls */}
        <Textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type anything"
          aria-label="Message"
          rows={1}
          className="max-h-50 min-h-10 resize-none rounded-none border-0 bg-transparent px-2 text-body-sm shadow-none focus-visible:ring-0 md:text-body-sm dark:bg-transparent"
        />
        <div className="flex items-center gap-2">
          <SendTemplateDialog chatId={chatId} label="Template" variant="ghost" size="sm" className="shrink-0">
            <ChevronDownIcon data-icon="inline-end" aria-hidden="true" className="hidden sm:block" />
          </SendTemplateDialog>
          <ClientChatsPicker chat={chat} />
          <Button
            type="submit"
            size="icon"
            className="ml-auto shrink-0 rounded-full"
            disabled={!content.trim()}
            aria-label="Send message"
          >
            <ArrowUpIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
      {addMessage.isError && (
        <p role="alert" className="text-body-sm text-destructive">
          {addMessage.error.message}
        </p>
      )}
    </form>
  )
}

interface ReadOnlyComposerProps extends MessageComposerProps {
  action: ReactNode
  children: ReactNode // why there's no text box
}

// The composer's card without a text box: why, then the chats picker and what can be done instead.
// On phones the action is its icon alone, and the picker gets the row's room
function ReadOnlyComposer({ chat, action, children }: ReadOnlyComposerProps) {
  return (
    <div className="p-4">
      <div className={CARD_CLASS}>
        <p className="px-2 py-1 text-body-sm text-muted-foreground">{children}</p>
        <div className="flex items-center gap-2">
          <ClientChatsPicker chat={chat} />
          {action}
        </div>
      </div>
    </div>
  )
}

// When it closed, what it means, and the way back to the client's current chat
function ClosedChatNotice({ chat }: MessageComposerProps) {
  const { data: clientChats } = useQuery(chatQueries.clientChats(chat.client_id))
  const current = clientChats?.find((other) => other.status !== 'CLOSED')
  const goToCurrent = current && (
    <Button asChild className="ml-auto shrink-0 max-sm:px-2" size="sm">
      <Link to="/chats/$chatId" params={{ chatId: current.id }} aria-label="Go to current chat">
        <Undo2Icon data-icon="inline-start" aria-hidden="true" />
        <span className="hidden sm:inline">Go to current chat</span>
      </Link>
    </Button>
  )

  return (
    <ReadOnlyComposer chat={chat} action={goToCurrent}>
      Closed {chat.closed_at && <time dateTime={chat.closed_at}>{formatDateTime(chat.closed_at)}</time>}. Nobody can
      reply here: if the client writes again, a new chat opens.
    </ReadOnlyComposer>
  )
}

// Open, but too long since the client wrote
function ClosedWindowNotice({ chat }: MessageComposerProps) {
  const sendTemplate = <SendTemplateDialog chatId={chat.id} label="Send template" className="ml-auto shrink-0 max-sm:px-2" />

  return (
    <ReadOnlyComposer chat={chat} action={sendTemplate}>
      This client last wrote over 24 hours ago. WhatsApp only allows templates now.
    </ReadOnlyComposer>
  )
}
