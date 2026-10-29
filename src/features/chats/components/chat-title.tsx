import { PencilIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'

import { cn } from '@/shared/lib/utils'

import { useRenameChat } from '../api/chat-mutations'
import { CHAT_TITLE_MAX_LENGTH, chatDisplayName, type Chat } from '../model/chat'

// The same look shown or edited: only the typing cursor tells them apart
const TITLE_CLASS = 'font-semibold text-foreground'

// Lives inside the chat's link: clicks on the pencil or the field must not open the chat
function keepOffTheLink(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

interface ChatTitleProps {
  chat: Chat
}

// The chat's name in the list, cut with … when long. A pencil on hover turns it into a real text
// field styled as the label: it behaves as a field (cursor, selection, typing); Enter or losing focus
// saves and ends editing, Escape cancels; clearing it gives the client's name back
export function ChatTitle({ chat }: ChatTitleProps) {
  const name = chatDisplayName(chat)
  const [draft, setDraft] = useState<string | null>(null) // null: not editing
  const isEditing = draft !== null
  const isCancelled = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const renameChat = useRenameChat(chat.id)

  // The member asked for the field with the pencil: the cursor goes straight into it, at the end
  useEffect(() => {
    const field = input.current
    if (!isEditing || !field) return
    field.focus()
    field.setSelectionRange(field.value.length, field.value.length)
  }, [isEditing])

  const handlePencilClick = (event: MouseEvent) => {
    keepOffTheLink(event)
    isCancelled.current = false
    setDraft(name)
  }

  // Losing focus ends editing; Enter and Escape get here by blurring
  const handleBlur = () => {
    if (draft === null) return
    const typed = draft.trim()
    setDraft(null)
    if (isCancelled.current) return
    // Unchanged, or the name shown without being the chat's own (the client's, or Untitled chat)
    if (typed === name && chat.title === null) return
    const title = typed || null
    if (title !== chat.title) renameChat.mutate({ title })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      isCancelled.current = true
      event.currentTarget.blur()
    }
  }

  if (isEditing) {
    return (
      <>
        <label htmlFor={inputId} className="sr-only">
          Chat name
        </label>
        <input
          ref={input}
          id={inputId}
          value={draft}
          maxLength={CHAT_TITLE_MAX_LENGTH}
          // Only the label's look: no border, background, padding or focus ring. select-text and
          // cursor-text undo what the row's button sets, so it selects and points like any field
          className={cn(
            TITLE_CLASS,
            'min-w-0 flex-1 cursor-text border-0 bg-transparent p-0 shadow-none outline-none select-text',
          )}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={keepOffTheLink}
        />
      </>
    )
  }

  return (
    <span className="group/title flex min-w-0 flex-1 items-center gap-1">
      <span className={cn(TITLE_CLASS, 'min-w-0 truncate')}>{name}</span>
      <button
        type="button"
        aria-label="Rename chat"
        disabled={renameChat.isPending}
        className="inline-flex shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/title:opacity-100 hover:text-foreground focus-visible:opacity-100"
        onClick={handlePencilClick}
      >
        <PencilIcon aria-hidden="true" className="size-3.5" />
      </button>
    </span>
  )
}
