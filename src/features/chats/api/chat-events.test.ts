import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { chatLiveEvents } from './chat-events'

const message = {
  id: 'm2',
  sender_type: 'CLIENT',
  content: 'hola',
  status: null,
  failure_reason: null,
  created_at: '2026-10-21T10:01:00Z',
}

function seededClient() {
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
    pages: [{ chats: [{ id: 'c1' }, { id: 'c2' }], next_after_updated_at: null, next_after_id: null }],
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

  it('leaves the chat in place for an update (the ticks)', () => {
    const queryClient = seededClient()

    chatLiveEvents(queryClient).events['message.updated']({ chat_id: 'c2', message })

    const chats = queryClient.getQueryData<Pages<{ chats: { id: string }[] }>>(['chats', 'list'])
    expect(chats?.pages[0].chats.map((c) => c.id)).toEqual(['c1', 'c2'])
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
