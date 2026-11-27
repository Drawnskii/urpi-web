import { useSyncExternalStore } from 'react'

// Calls onChange whenever the tab goes to the front or the back; returns how to stop
export function subscribeToVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

// true while the tab is in front (not minimized, not a background tab)
export function useDocumentVisible() {
  return useSyncExternalStore(subscribeToVisibility, () => document.visibilityState === 'visible')
}
