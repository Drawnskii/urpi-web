import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CircleAlertIcon, FileTextIcon, RotateCwIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { useHoverPopover } from '@/shared/hooks'

import { useRetryMessage } from '../api/chat-mutations'
import { chatQueries } from '../api/chat-queries'
import { useServiceWindow } from '../hooks/use-service-window'
import type { Message } from '../model/chat'
import { failureNotice, type FailureAction } from '../model/send-failure'
import { TemplateDialog } from './send-template-dialog'

// The pages that fix what the others failed over
const PAGES = {
  payment: { to: '/whatsapp', label: 'Add a payment method' },
  number: { to: '/whatsapp', label: 'Check your WhatsApp number' },
  templates: { to: '/templates', label: 'See your templates' },
} as const

interface MessageFailureProps {
  chatId: string
  message: Message
}

// A failed message's red icon: over it, or pressing it, why it failed and what to do. The retry and
// the template dialog live here, so they outlast the popover
export function MessageFailure({ chatId, message }: MessageFailureProps) {
  const popover = useHoverPopover()
  const retry = useRetryMessage(chatId)
  const [isChoosingTemplate, setIsChoosingTemplate] = useState(false)
  const iconRef = useRef<HTMLButtonElement>(null)
  const notice = failureNotice(message)
  if (!notice) return null

  function chooseTemplate() {
    popover.close()
    setIsChoosingTemplate(true)
  }

  return (
    <>
      <Popover {...popover.root}>
        <PopoverTrigger asChild>
          {/* Padded to a 24px target, without moving the time next to it */}
          <button
            ref={iconRef}
            type="button"
            aria-label={`Failed. ${notice.reason}`}
            className="-m-1 flex cursor-pointer rounded-full p-1 text-failed"
            {...popover.trigger}
          >
            <CircleAlertIcon aria-hidden="true" className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 items-start" {...popover.content}>
          <p>{notice.reason}</p>
          {notice.action === 'retry' || notice.action === 'template' ? (
            <Resend
              chatId={chatId}
              action={notice.action}
              isRetrying={retry.isPending}
              onRetry={() => retry.mutate(message.id)}
              onChooseTemplate={chooseTemplate}
            />
          ) : (
            notice.action && <PageLink action={notice.action} />
          )}
          {retry.error && (
            <p role="alert" className="text-destructive">
              {retry.error.message}
            </p>
          )}
        </PopoverContent>
      </Popover>
      <TemplateDialog
        chatId={chatId}
        open={isChoosingTemplate}
        onOpenChange={setIsChoosingTemplate}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          iconRef.current?.focus()
        }}
      />
    </>
  )
}

function PageLink({ action }: { action: keyof typeof PAGES }) {
  const page = PAGES[action]

  return (
    <Button asChild variant="outline" size="sm">
      <Link to={page.to}>{page.label}</Link>
    </Button>
  )
}

interface ResendProps {
  chatId: string
  action: Extract<FailureAction, 'retry' | 'template'>
  isRetrying: boolean
  onRetry: () => void
  onChooseTemplate: () => void
}

// Writing to the client again, while the chat takes it: nothing in a closed one, and a template once
// the window is closed, whatever failed
function Resend({ chatId, action, isRetrying, onRetry, onChooseTemplate }: ResendProps) {
  const { data: chat } = useQuery(chatQueries.detail(chatId))
  const isWindowClosed = useServiceWindow(chat?.window_expires_at ?? null) === 0

  if (!chat || chat.status === 'CLOSED') return null
  if (action === 'template' || isWindowClosed) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={onChooseTemplate}>
        <FileTextIcon data-icon="inline-start" aria-hidden="true" />
        Send template
      </Button>
    )
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
      <RotateCwIcon data-icon="inline-start" aria-hidden="true" className={isRetrying ? 'animate-spin' : ''} />
      {isRetrying ? 'Sending…' : 'Try again'}
    </Button>
  )
}
