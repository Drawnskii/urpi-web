import { InfoIcon } from 'lucide-react'
import type { MouseEvent } from 'react'

import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/shared/components/ui/popover'
import { useHoverPopover } from '@/shared/hooks'

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
  const popover = useHoverPopover()

  return (
    <Popover {...popover.root}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Client: ${name ?? 'no name yet'}, ${phoneNumber}`}
          className="inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          {...popover.trigger}
          onClick={(event) => {
            keepOffTheLink(event)
            popover.trigger.onClick(event)
          }}
        >
          <InfoIcon aria-hidden="true" className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end" // the icon is at the row's right edge: the card opens toward the list
        className="w-auto min-w-56"
        {...popover.content}
        onClick={keepOffTheLink}
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
