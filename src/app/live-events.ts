import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { chatLiveEvents } from '@/features/chats'
import { templateLiveEvents } from '@/features/message-templates'
import { connectLiveEvents } from '@/shared/api'

// The tenant's one live events stream, open on every page. Only the app layer knows every
// feature that listens; each feature says what its own events do
export function useLiveEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Opened once per tab, before the page's queries finish: a page loaded before the stream
    // listened may have missed a change, so refetch what was fetched before it
    return connectLiveEvents({
      path: '/events',
      subscribers: [chatLiveEvents(queryClient), templateLiveEvents(queryClient)],
      onFirstReady: () => {
        const readyAt = Date.now()
        void queryClient.invalidateQueries({
          predicate: (query) => query.state.dataUpdatedAt !== 0 && query.state.dataUpdatedAt < readyAt,
        })
      },
    })
  }, [queryClient])
}
