import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { chatLiveEvents } from '@/features/chats'
import { templateLiveEvents } from '@/features/message-templates'
import { useCurrentTenantId } from '@/features/tenants'
import { whatsAppConnectionLiveEvents } from '@/features/whatsapp-connection'
import { connectLiveEvents } from '@/shared/api'

import { checkSessionAfterStreamEnded } from './session'

// The business's one live events stream, open on every page. Only the app layer knows every
// feature that listens; each feature says what its own events do
export function useLiveEvents() {
  const queryClient = useQueryClient()
  // The stream is per business: none before the user has one (onboarding)
  const tenantId = useCurrentTenantId()

  useEffect(() => {
    if (!tenantId) return
    // Opened once per tab, before the page's queries finish: a page loaded before the stream
    // listened may have missed a change, so refetch what was fetched before it
    return connectLiveEvents({
      path: '/events',
      subscribers: [chatLiveEvents(queryClient), templateLiveEvents(queryClient), whatsAppConnectionLiveEvents(queryClient)],
      onFirstReady: () => {
        const readyAt = Date.now()
        void queryClient.invalidateQueries({
          predicate: (query) => query.state.dataUpdatedAt !== 0 && query.state.dataUpdatedAt < readyAt,
        })
      },
      onEnded: () => void checkSessionAfterStreamEnded(queryClient),
    })
  }, [queryClient, tenantId])
}
