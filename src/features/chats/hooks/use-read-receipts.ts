import { useEffect } from 'react'

import { useDocumentVisible } from '@/shared/hooks'

import { isMarkedRead, useMarkChatRead } from '../api/chat-mutations'
import { useLatestClientMessageId } from '../api/chat-queries'

// Marks the open chat read while the member can see it: when it opens, when a client message
// arrives (the stream adds it to the cache) and when the tab comes back to the front.
// One call per new client message: marking the newest marks every earlier one
export function useReadReceipts(chatId: string) {
  const latestClientMessageId = useLatestClientMessageId(chatId)
  const isVisible = useDocumentVisible()
  const { mutate: markRead } = useMarkChatRead(chatId)

  useEffect(() => {
    if (!latestClientMessageId || !isVisible || isMarkedRead(chatId, latestClientMessageId)) return
    markRead(latestClientMessageId)
  }, [chatId, latestClientMessageId, isVisible, markRead])
}
