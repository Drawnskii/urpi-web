import { ArrowUpIcon, ChevronDownIcon, FileTextIcon } from 'lucide-react'
import { useState, type ChangeEvent, type KeyboardEvent, type SubmitEvent } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'

import { useAddMessage } from '../api/chat-mutations'
import { useTypingIndicator } from '../hooks/use-typing-indicator'

interface MessageComposerProps {
  chatId: string
}

export function MessageComposer({ chatId }: MessageComposerProps) {
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
      {/* One card for the text and its actions; it shows the focus ring the textarea gives up */}
      <div className="flex flex-col gap-1 rounded-xl border border-input bg-card p-2 shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
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
          <Button type="button" variant="ghost" size="sm" disabled title="Sending templates from a chat is coming soon">
            <FileTextIcon data-icon="inline-start" aria-hidden="true" />
            Template
            <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button type="submit" size="icon" className="ml-auto rounded-full" disabled={!content.trim()} aria-label="Send message">
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
