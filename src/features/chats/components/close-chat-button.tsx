import { ArchiveIcon } from 'lucide-react'
import { useState, type MouseEvent } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'

import { useCloseChat } from '../api/chat-mutations'
import type { Chat } from '../model/chat'

interface CloseChatButtonProps {
  chat: Chat
}

// The icon button next to the client's chats picker. Closing can't be undone, so it always asks
// first and says what happens; the dialog stays open until the server confirms, or shows why not
export function CloseChatButton({ chat }: CloseChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const closeChat = useCloseChat(chat.id)
  const isClosed = chat.status === 'CLOSED'
  const client = chat.client_name ?? 'the client'

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) closeChat.reset()
  }

  // Radix closes the dialog on the action's click: wait for the server instead
  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    closeChat.mutate(undefined, { onSuccess: () => setIsOpen(false) })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          disabled={isClosed}
          aria-label="Close chat"
          title={isClosed ? 'This chat is closed' : 'Close chat'}
        >
          <ArchiveIcon aria-hidden="true" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this chat?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2">
              <p>Once it's closed:</p>
              <ul className="list-disc pl-5">
                <li>Nobody answers it any more: not the agent, and no one on your team can reply in it.</li>
                <li>Its messages stay. Find them in this client's past chats, next to the message box.</li>
                <li>If {client} writes again, a new chat opens, and the agent starts it without this chat's history.</li>
              </ul>
              <p>You can't reopen it.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {closeChat.isError && (
          <p role="alert" className="text-body-sm text-destructive">
            {closeChat.error.message}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={closeChat.isPending}>Keep it open</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={closeChat.isPending} onClick={handleConfirm}>
            {closeChat.isPending ? 'Closing…' : 'Close chat'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
