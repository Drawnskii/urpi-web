import type { QueryClient } from '@tanstack/react-query'

import type { LiveEventsSubscriber } from '@/shared/api'
import { patchOrRefetch } from '@/shared/lib'

import type { WhatsAppConnection, WhatsAppConnectionEvent } from '../model/whatsapp-connection'
import { whatsAppConnectionKeys } from './whatsapp-connection-queries'

// The number's part of the live events stream: connecting, Meta finishing, a disconnect from
// another tab or by Meta itself. The server pushes the number as it is now (null once it's
// gone), so the cache takes it as is, in any order. After a reconnection the server replays it
export function whatsAppConnectionLiveEvents(queryClient: QueryClient): LiveEventsSubscriber {
  return {
    events: {
      'whatsapp_connection.updated': (data) =>
        patchOrRefetch<WhatsAppConnection | null>(
          queryClient,
          whatsAppConnectionKeys.detail(),
          () => (data as WhatsAppConnectionEvent).connection,
        ),
      // Rare: more was missed than the server replays: read it again
      resync: () => void queryClient.invalidateQueries({ queryKey: whatsAppConnectionKeys.detail() }),
    },
  }
}
