import { useCallback, useRef } from 'react'

import { useShowTyping } from '../api/chat-mutations'
import { useLatestClientMessageId } from '../api/chat-queries'

// The client's indicator lasts about 25 s: renew it a little before it fades, never per keystroke
const TYPING_RENEW_MS = 20_000

// notifyTyping: call on every keystroke; sends at most one request per TYPING_RENEW_MS.
// reset: call when a message is sent (WhatsApp hides the indicator), so the next keystroke shows it again
export function useTypingIndicator(chatId: string) {
  const latestClientMessageId = useLatestClientMessageId(chatId)
  const { mutate: showTyping } = useShowTyping(chatId)
  // Which chat the last indicator went to, and when: another chat's client hasn't seen one yet
  const lastSent = useRef({ chatId: '', at: 0 })

  const notifyTyping = useCallback(() => {
    // The indicator hangs on a client message: none yet, nothing to show it on
    if (!latestClientMessageId) return
    const now = Date.now()
    if (lastSent.current.chatId === chatId && now - lastSent.current.at < TYPING_RENEW_MS) return
    lastSent.current = { chatId, at: now }
    showTyping(latestClientMessageId)
  }, [chatId, latestClientMessageId, showTyping])

  const reset = useCallback(() => {
    lastSent.current = { chatId: '', at: 0 }
  }, [])

  return { notifyTyping, reset }
}
