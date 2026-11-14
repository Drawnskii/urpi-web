import { Outlet } from '@tanstack/react-router'

import { useLiveEvents } from '../live-events'
import { AppShell } from './app-shell'

// Every signed-in page: the shell around it, and the business's live stream underneath
export function AppLayout() {
  useLiveEvents() // one stream per tab, whichever page is open

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
