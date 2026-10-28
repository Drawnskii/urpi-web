import { Outlet, useChildMatches } from '@tanstack/react-router'

import { ChatList } from '@/features/chats'
import { useLiveEventsStatus, type LiveEventsStatus } from '@/shared/api'

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
    <div className="flex min-h-0 flex-1 flex-col">
      <output className="border-b px-3 py-1 empty:hidden">{streamNotice}</output>
      {/* Fills the rest of the height, so the list's border runs top to bottom with any number of chats */}
      <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr]">
        <aside className="min-h-0 border-r">
          <ChatList />
        </aside>
        <section className="flex min-h-0 flex-col">
          {hasSelectedChat ? <Outlet /> : <p className="m-auto">Select a chat</p>}
        </section>
      </div>
    </div>
  )
}
