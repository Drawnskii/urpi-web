import { create } from 'zustand'

// Who is writing a reply in each chat, from the live events stream (chat.typing): teammates by
// member id, the agent as null. Live only, never fetched: the server doesn't replay it
interface ChatWriter {
  memberId: string | null
  expiresAt: number // epoch ms: hidden after this unless chat.typing renews it
}

interface TypingState {
  writers: Record<string, ChatWriter[]> // by chat id, in the order they started; nobody: no key
  setTyping: (chatId: string, memberId: string | null, expiresInSeconds: number) => void
  stopTyping: (chatId: string, memberId: string | null) => void
}

const NO_WRITERS: ChatWriter[] = []

const useTypingStore = create<TypingState>()((set, get) => ({
  writers: {},
  setTyping: (chatId, memberId, expiresInSeconds) => {
    if (expiresInSeconds <= 0) return get().stopTyping(chatId, memberId)
    const writer = { memberId, expiresAt: Date.now() + expiresInSeconds * 1000 }
    set(({ writers }) => {
      const current = writers[chatId] ?? NO_WRITERS
      const isRenewal = current.some((other) => other.memberId === memberId)
      const next = isRenewal ? current.map((other) => (other.memberId === memberId ? writer : other)) : [...current, writer]
      return { writers: { ...writers, [chatId]: next } }
    })
    // Hide it when it expires, unless renewed meanwhile (a later expiresAt)
    setTimeout(() => {
      const latest = get().writers[chatId]?.find((other) => other.memberId === memberId)
      if (latest && latest.expiresAt <= Date.now()) get().stopTyping(chatId, memberId)
    }, expiresInSeconds * 1000)
  },
  stopTyping: (chatId, memberId) => {
    const current = get().writers[chatId] ?? NO_WRITERS
    if (!current.some((writer) => writer.memberId === memberId)) return // nothing to change, no re-render
    const left = current.filter((writer) => writer.memberId !== memberId)
    set(({ writers }) => {
      const next = { ...writers }
      if (left.length > 0) next[chatId] = left
      else delete next[chatId]
      return { writers: next }
    })
  },
}))

// The chat's writers. The same array until it changes, so a row re-renders only then
export const useChatWriters = (chatId: string) => useTypingStore((state) => state.writers[chatId] ?? NO_WRITERS)

// Outside React: the live events stream (and tests)
export const getChatWriters = (chatId: string) => useTypingStore.getState().writers[chatId] ?? NO_WRITERS
export const setTyping = (chatId: string, memberId: string | null, expiresInSeconds: number) =>
  useTypingStore.getState().setTyping(chatId, memberId, expiresInSeconds)
export const stopTyping = (chatId: string, memberId: string | null) =>
  useTypingStore.getState().stopTyping(chatId, memberId)
