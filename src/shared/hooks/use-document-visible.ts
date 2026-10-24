import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

// true while the tab is in front (not minimized, not a background tab)
export function useDocumentVisible() {
  return useSyncExternalStore(subscribe, () => document.visibilityState === 'visible')
}
