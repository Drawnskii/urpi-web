import { Outlet, useChildMatches } from '@tanstack/react-router'

import { ChatList } from '@/features/chats'
import { useLiveEventsStatus, type LiveEventsStatus } from '@/shared/api'
import { cn } from '@/shared/lib/utils'

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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* One h1 per page; the list and the conversation need no visible title */}
      <h1 className="sr-only">Chats</h1>
      <output className="border-b px-3 py-1 text-body-sm empty:hidden">{streamNotice}</output>
      {/* Fills the rest of the height, so the list's border runs top to bottom with any number of chats.
          minmax(0, 1fr): the open chat never grows past its column, so the list always stays in view.
          Below lg (the sidebar takes 13rem) one pane at a time: the list, or the open chat (with its way back to the list) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={cn('min-h-0 lg:block lg:border-r', hasSelectedChat && 'hidden')}>
          <ChatList />
        </aside>
        <section className={cn('min-h-0 min-w-0 flex-col lg:flex', hasSelectedChat ? 'flex' : 'hidden')}>
          {hasSelectedChat ? <Outlet /> : <p className="m-auto text-muted-foreground">Select a chat</p>}
        </section>
      </div>
    </div>
  )
}
