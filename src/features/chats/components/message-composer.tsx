import { useState, type FormEvent, type KeyboardEvent } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'

import { useAddMessage } from '../api/chat-mutations'

interface MessageComposerProps {
  chatId: string
}

export function MessageComposer({ chatId }: MessageComposerProps) {
  const [content, setContent] = useState('')
  const addMessage = useAddMessage(chatId)

  function send() {
    if (!content.trim()) return
    // The message shows at once (optimistic); if the send fails, it's removed and the text comes back
    addMessage.mutate({ content }, { onError: () => setContent(content) })
    setContent('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    send()
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
      <div className="flex items-end gap-2">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message"
          aria-label="Message"
          className="flex-1"
        />
        <Button type="submit" disabled={!content.trim()}>
          Send
        </Button>
      </div>
      {addMessage.isError && <p role="alert">{addMessage.error.message}</p>}
    </form>
  )
}
