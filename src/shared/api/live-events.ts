import { create } from 'zustand'

import { streamUrl } from './http-client'

// The tenant's live events (SSE): one stream per tab, for the whole app. Features subscribe to
// their own event names; this file knows none of them

// connecting: opening. live: normal. reconnecting: no stream for a while (the browser retries).
// ended: the server refused the stream (not a member anymore); the browser won't retry
export type LiveEventsStatus = 'connecting' | 'live' | 'reconnecting' | 'ended'

export const useLiveEventsStore = create<{ status: LiveEventsStatus }>(() => ({ status: 'connecting' }))

// The selector pages use: re-renders only when the status changes
export const useLiveEventsStatus = () => useLiveEventsStore((state) => state.status)

function setStatus(status: LiveEventsStatus) {
  useLiveEventsStore.setState({ status })
}

export interface LiveEventsSubscriber {
  // Event name → what to do with its data (already parsed from JSON)
  events: Record<string, (data: unknown) => void>
  // The browser reconnected: the server replays what it can; refetch what it doesn't
  onReconnect?: () => void
}

// A reconnection normally takes 3–6 s (every stream expires after ~10 minutes); only longer is worth showing
const RECONNECTING_NOTICE_MS = 8000

// Opens the stream and hands each event to its subscriber. Returns the close function.
// onFirstReady: the stream is listening for the first time (data loaded before it may be stale)
export function connectLiveEvents(options: {
  path: string
  subscribers: LiveEventsSubscriber[]
  onFirstReady?: () => void
}) {
  const source = new EventSource(streamUrl(options.path))
  let hasSeenReady = false
  let reconnectingNotice: ReturnType<typeof setTimeout> | undefined
  setStatus('connecting')

  source.addEventListener('ready', () => {
    clearTimeout(reconnectingNotice)
    setStatus('live')
    if (hasSeenReady) {
      for (const subscriber of options.subscribers) subscriber.onReconnect?.()
      return
    }
    hasSeenReady = true
    options.onFirstReady?.()
  })

  for (const subscriber of options.subscribers) {
    for (const [name, handle] of Object.entries(subscriber.events)) {
      source.addEventListener(name, (event) => handle(JSON.parse(event.data)))
    }
  }

  source.onerror = () => {
    clearTimeout(reconnectingNotice)
    if (source.readyState === EventSource.CLOSED) {
      // The server refused the stream (404: not a member anymore). The browser won't retry
      setStatus('ended')
      return
    }
    // CONNECTING: a dropped connection or the stream's planned expiry. The browser retries by
    // itself (with Last-Event-ID); only say so if it takes longer than a normal reconnection
    reconnectingNotice = setTimeout(() => setStatus('reconnecting'), RECONNECTING_NOTICE_MS)
  }

  return () => {
    clearTimeout(reconnectingNotice)
    source.close()
  }
}
