import { MapPinIcon } from 'lucide-react'

import type { MessageOf } from '../model/chat'
import { locationUrl } from '../model/message-location'

interface LocationMessageProps {
  message: MessageOf<'LOCATION'>
}

// A place the client shared: its name and address, and a link to it on a map (a new tab)
export function LocationMessage({ message }: LocationMessageProps) {
  const { name, address } = message.payload

  return (
    <div className="flex min-w-0 items-start gap-2">
      <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 opacity-70" />
      <div className="flex min-w-0 flex-col">
        {name && <span className="text-body-sm font-medium wrap-anywhere">{name}</span>}
        {address && <span className="text-body-sm wrap-anywhere">{address}</span>}
        {!name && !address && <span className="text-body-sm font-medium">Location</span>}
        <a
          href={locationUrl(message.payload)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-body-sm underline underline-offset-2"
        >
          View on map
        </a>
      </div>
    </div>
  )
}
