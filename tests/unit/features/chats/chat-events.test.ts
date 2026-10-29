import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { chatLiveEvents } from '@/features/chats/api/chat-events'

const message = {
  id: 'm2',
  sender_type: 'CLIENT',
  content: 'hola',
  status: null,
  failure_reason: null,
  created_at: '2026-10-21T10:01:00Z',
}

const lastOfC2 = { ...message, id: 'm1', created_at: '2026-10-21T10:00:00Z' }

function seededClient(c2LastMessage: typeof message = lastOfC2) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(['chats', 'messages', 'c2'], {
    pages: [
      {
        messages: [{ ...message, id: 'm1', created_at: '2026-10-21T10:00:00Z' }],
        next_before_created_at: null,
        next_before_id: null,
      },
    ],
    pageParams: [undefined],
  })
  queryClient.setQueryData(['chats', 'list'], {
    pages: [{ chats: [
          { id: 'c1', last_message: null, unread_count: 0 },
          { id: 'c2', last_message: c2LastMessage, unread_count: 0 },
        ], next_after_updated_at: null, next_after_id: null }],
    pageParams: [undefined],
  })
  return queryClient
}

type Pages<T> = { pages: T[] }

describe('chatLiveEvents', () => {
  it('writes a pushed message into the open chat and moves the chat to the top', () => {
    const queryClient = seededClient()

    chatLiveEvents(queryClient).events['message.created']({ chat_id: 'c2', message })

    const messages = queryClient.getQueryData<Pages<{ messages: { id: string }[] }>>(['chats', 'messages', 'c2'])
    const chats = queryClient.getQueryData<Pages<{ chats: { id: string }[] }>>(['chats', 'list'])
    expect(messages?.pages[0].messages.map((m) => m.id)).toEqual(['m2', 'm1'])
    expect(chats?.pages[0].chats.map((c) => c.id)).toEqual(['c2', 'c1'])
  })

  it("leaves the chat in place for an update of its last message (the ticks)", () => {
    const queryClient = seededClient(message)

    chatLiveEvents(queryClient).events['message.updated']({ chat_id: 'c2', message })

    const chats = queryClient.getQueryData<Pages<{ chats: { id: string }[] }>>(['chats', 'list'])
    expect(chats?.pages[0].chats.map((c) => c.id)).toEqual(['c1', 'c2'])
  })

  it('counts a pushed client message as unread', () => {
    const queryClient = seededClient()

    chatLiveEvents(queryClient).events['message.created']({ chat_id: 'c2', message })

    const chats = queryClient.getQueryData<Pages<{ chats: { id: string; unread_count: number }[] }>>(['chats', 'list'])
    expect(chats?.pages[0].chats[0]).toMatchObject({ id: 'c2', unread_count: 1 })
  })

  it("sets the server's unread count on chat.read", () => {
    const queryClient = seededClient()
    chatLiveEvents(queryClient).events['message.created']({ chat_id: 'c2', message })

    chatLiveEvents(queryClient).events['chat.read']({ chat_id: 'c2', unread_count: 0 })

    const chats = queryClient.getQueryData<Pages<{ chats: { id: string; unread_count: number }[] }>>(['chats', 'list'])
    expect(chats?.pages[0].chats.find((c) => c.id === 'c2')?.unread_count).toBe(0)
  })

  it('refetches the chat list and every chat on resync', () => {
    const queryClient = seededClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    chatLiveEvents(queryClient).events.resync({})

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'list'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'messages'] })
  })

  it('needs nothing on reconnect: the server replays the messages', () => {
    expect(chatLiveEvents(new QueryClient()).onReconnect).toBeUndefined()
  })
})
