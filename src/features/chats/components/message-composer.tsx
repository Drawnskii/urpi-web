import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowUpIcon, ChevronDownIcon, FileTextIcon, Undo2Icon } from 'lucide-react'
import { useState, type ChangeEvent, type KeyboardEvent, type SubmitEvent } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { formatDateTime } from '@/shared/lib'

import { useAddMessage } from '../api/chat-mutations'
import { chatQueries } from '../api/chat-queries'
import { useTypingIndicator } from '../hooks/use-typing-indicator'
import type { Chat } from '../model/chat'
import { ClientChatsPicker } from './client-chats-picker'

// One card for the text and its actions; it shows the focus ring the textarea gives up
const CARD_CLASS =
  'flex flex-col gap-1 rounded-xl border border-input bg-card p-2 shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50'

interface MessageComposerProps {
  chat: Chat
}

// A closed chat can't be answered: the card says so instead of offering a text box
export function MessageComposer({ chat }: MessageComposerProps) {
  if (chat.status === 'CLOSED') return <ClosedChatNotice chat={chat} />
  return <OpenChatComposer chat={chat} />
}

function OpenChatComposer({ chat }: MessageComposerProps) {
  const chatId = chat.id
  const [content, setContent] = useState('')
  const addMessage = useAddMessage(chatId)
  const typing = useTypingIndicator(chatId)

  function send() {
    if (!content.trim()) return
    // The message shows at once (optimistic); if the send fails, it's removed and the text comes back
    addMessage.mutate({ content }, { onError: () => setContent(content) })
    setContent('')
    typing.reset()
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    send()
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)
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
          {/* Where sending a template will start (after 24 hours, only a template can reach the client) */}
          {/* The icon alone on phones: the row's room goes to the chats picker */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            disabled
            aria-label="Template"
            title="Sending templates from a chat is coming soon"
          >
            <FileTextIcon data-icon="inline-start" aria-hidden="true" />
            <span className="hidden sm:inline">Template</span>
            <ChevronDownIcon data-icon="inline-end" aria-hidden="true" className="hidden sm:block" />
          </Button>
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

// Read only: when it closed, what it means, and the way back to the client's current chat
function ClosedChatNotice({ chat }: MessageComposerProps) {
  const { data: clientChats } = useQuery(chatQueries.clientChats(chat.client_id))
  const current = clientChats?.find((other) => other.status !== 'CLOSED')

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className={CARD_CLASS}>
        <p className="px-2 py-1 text-body-sm text-muted-foreground">
          Closed{' '}
          {chat.closed_at && <time dateTime={chat.closed_at}>{formatDateTime(chat.closed_at)}</time>}. Nobody can
          reply here: if the client writes again, a new chat opens.
        </p>
        <div className="flex items-center gap-2">
          <ClientChatsPicker chat={chat} />
          {current && (
            // Phones: the arrow alone, a 32px square like the picker, which gets the row's room
            <Button asChild className="ml-auto shrink-0 max-sm:px-2">
              <Link to="/chats/$chatId" params={{ chatId: current.id }} aria-label="Go to current chat">
                <Undo2Icon data-icon="inline-start" aria-hidden="true" />
                <span className="hidden sm:inline">Go to current chat</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
