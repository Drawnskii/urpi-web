import type { InfiniteData } from '@tanstack/react-query'

import type { ChatPage, Message, MessagePage } from '../model/chat'

// Pure cache patches for the infinite queries in chat-queries.ts: no React, no network

type Messages = InfiniteData<MessagePage> | undefined
type Chats = InfiniteData<ChatPage> | undefined

// Newest first, like the API: by created_at, then id (UUIDv7 ids sort by creation time).
// Date.parse, not string order: the server and an optimistic message format times differently
function newestFirst(a: Message, b: Message) {
  const byTime = Date.parse(b.created_at) - Date.parse(a.created_at)
  if (byTime !== 0) return byTime
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0
}

// Any pushed message, live or replayed: replaced where it is; else inserted in order in the
// newest page; else skipped, when it's older than everything in the newest page and older
// pages exist (it belongs to a page the user never scrolled to: it shows up when they do)
export function upsertMessage(data: Messages, message: Message): Messages {
  if (!data) return data // chat not open: it loads fresh when opened

  let isFound = false
  const pages = data.pages.map((page) => ({
    ...page,
    messages: page.messages.map((current) => {
      if (current.id !== message.id) return current
      isFound = true
      return message
    }),
  }))
  if (isFound) return { ...data, pages }

  const [newest, ...older] = pages
  const oldestShown = newest.messages.at(-1)
  if (oldestShown && newestFirst(message, oldestShown) > 0 && newest.next_before_id !== null) {
    return data // older than this page, and more pages exist
  }
  return { ...data, pages: [{ ...newest, messages: [...newest.messages, message].sort(newestFirst) }, ...older] }
}

// Removes a message by id (the optimistic one, once the saved one exists or the POST failed)
export function removeMessage(data: Messages, id: string): Messages {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, messages: page.messages.filter((message) => message.id !== id) })),
  }
}

// The chat moves to the top of the list. undefined when the chat isn't loaded: a new chat,
// whose Chat the event doesn't carry, so the caller refetches the list
export function moveChatToTop(data: Chats, chatId: string): Chats {
  if (!data) return data
  const chat = data.pages.flatMap((page) => page.chats).find((current) => current.id === chatId)
  if (!chat) return undefined

  const pages = data.pages.map((page) => ({ ...page, chats: page.chats.filter((current) => current.id !== chatId) }))
  const [first, ...rest] = pages
  return { ...data, pages: [{ ...first, chats: [chat, ...first.chats] }, ...rest] }
}
