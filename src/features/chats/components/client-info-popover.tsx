import { InfoIcon } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'

import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/shared/components/ui/popover'

// Long enough to move the pointer from the icon into the card without it closing
const CLOSE_DELAY_MS = 150

// Lives inside the chat's link: clicks must neither follow it nor reach it from the portal
function keepOffTheLink(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

interface ClientInfoPopoverProps {
  name: string | null   // the tenant's name for the client, else their WhatsApp name
  phoneNumber: string
}

// The client's details (never the chat's): more than the list row has room for. Opens on hover,
// or a click (touch screens, keyboard)
export function ClientInfoPopover({ name, phoneNumber }: ClientInfoPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Shared by the icon and the card: moving between them keeps it open
  const handlePointerEnter = () => {
    window.clearTimeout(closeTimer.current)
    setIsOpen(true)
  }
  const handlePointerLeave = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS)
  }
  const handleTriggerClick = (event: MouseEvent) => {
    keepOffTheLink(event)
    setIsOpen((current) => !current)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Client: ${name ?? 'no name yet'}, ${phoneNumber}`}
          className="inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleTriggerClick}
        >
          <InfoIcon aria-hidden="true" className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end" // the icon is at the row's right edge: the card opens toward the list
        className="w-auto min-w-56"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={keepOffTheLink}
        onOpenAutoFocus={(event) => event.preventDefault()} // hover shouldn't steal focus from the list
      >
        <PopoverHeader>
          <PopoverTitle>Client</PopoverTitle>
        </PopoverHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{name ?? 'No name yet'}</dd>
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="tabular-nums">{phoneNumber}</dd>
        </dl>
      </PopoverContent>
    </Popover>
  )
}
