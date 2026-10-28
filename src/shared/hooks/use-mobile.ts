import { useSyncExternalStore } from 'react'

const MOBILE_BREAKPOINT = 768
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

// true below md (768px): the sidebar becomes a sheet. shadcn's sidebar imports it by this name
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
