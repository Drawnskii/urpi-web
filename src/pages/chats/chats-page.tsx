import { Link, Outlet, useChildMatches } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { ChatList } from '@/features/chats'
import { useLiveEventsStatus, type LiveEventsStatus } from '@/shared/api'
import { Button } from '@/shared/components/ui/button'

const STREAM_NOTICES: Partial<Record<LiveEventsStatus, string>> = {
  reconnecting: 'Reconnecting…',
  ended: 'Your session ended. Sign in again.',
}

export function ChatsPage() {
  // The app opens the stream (app/live-events.ts); this page only shows when it's down
  const streamStatus = useLiveEventsStatus()

  // No child route matched: /chats without a chat selected
  const hasSelectedChat = useChildMatches().length > 0
  const streamNotice = STREAM_NOTICES[streamStatus]

  return (
    <main className="grid h-svh grid-cols-[320px_1fr] grid-rows-[auto_1fr]">
      <header className="col-span-2 flex items-center gap-4 p-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
            Home
          </Link>
        </Button>
        <output>{streamNotice}</output>
      </header>
      <aside className="min-h-0">
        <ChatList />
      </aside>
      <section className="flex min-h-0 flex-col">
        {hasSelectedChat ? <Outlet /> : <p className="m-auto">Select a chat</p>}
      </section>
    </main>
  )
}
