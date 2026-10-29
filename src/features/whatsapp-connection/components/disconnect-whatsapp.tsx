import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'

import { useDisconnectWhatsAppAccount } from '../api/whatsapp-connection-mutations'
import type { WhatsAppConnection } from '../model/whatsapp-connection'

interface DisconnectWhatsAppProps {
  connection: WhatsAppConnection
  onDisconnected: () => void
}

// Two clicks: disconnecting stops every chat on the number at once
export function DisconnectWhatsApp({ connection, onDisconnected }: DisconnectWhatsAppProps) {
  const disconnect = useDisconnectWhatsAppAccount()
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isConfirming) {
    return (
      <Button type="button" variant="outline" onClick={() => setIsConfirming(true)}>
        Disconnect
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <p>
        Disconnect {connection.phone_number}? Urpi stops receiving and sending its messages and forgets its access.
        Your chats stay.
      </p>
      <p className="text-body-sm text-muted-foreground">
        To connect the number again, first turn off its two-step verification in WhatsApp Manager.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={disconnect.isPending}
          onClick={() => disconnect.mutate(undefined, { onSuccess: onDisconnected })}
        >
          {disconnect.isPending ? 'Disconnecting…' : 'Yes, disconnect'}
        </Button>
        <Button type="button" variant="ghost" disabled={disconnect.isPending} onClick={() => setIsConfirming(false)}>
          Cancel
        </Button>
      </div>
      {disconnect.error && <p role="alert" className="text-body-sm text-destructive">{disconnect.error.message}</p>}
    </div>
  )
}
