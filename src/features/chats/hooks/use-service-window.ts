import { useCallback, useSyncExternalStore } from 'react'

import { subscribeToVisibility } from '@/shared/hooks'

import { serviceWindow } from '../model/service-window'

// The window's minutesLeft (0: closed; null: over an hour left), current without a reload: it
// re-renders only when that value changes
export function useServiceWindow(expiresAt: string | null) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      let timer: ReturnType<typeof setTimeout> | undefined
      function schedule() {
        clearTimeout(timer)
        const { changesInMs } = serviceWindow(expiresAt, Date.now())
        if (changesInMs === null) return
        timer = setTimeout(() => {
          onChange()
          schedule()
        }, changesInMs)
      }
      schedule()
      // A background tab's timers run late (a sleeping computer's too): look again when it's back
      const stopWatching = subscribeToVisibility(() => {
        onChange()
        schedule()
      })
      return () => {
        clearTimeout(timer)
        stopWatching()
      }
    },
    [expiresAt],
  )
  return useSyncExternalStore(subscribe, () => serviceWindow(expiresAt, Date.now()).minutesLeft)
}
