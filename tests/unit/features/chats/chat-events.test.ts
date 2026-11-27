import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { chatLiveEvents } from '@/features/chats/api/chat-events'
import { getChatWriters } from '@/features/chats/model/typing-store'

const message = {
  id: 'm2',
  sender_type: 'CLIENT',
  sender_tenant_member_id: null as string | null,
  content: 'hola',
  type: 'TEXT',
  payload: {},
  status: null,
  failure_reason: null,
  created_at: '2026-10-21T10:01:00Z',
}

const lastOfC2 = { ...message, id: 'm1', created_at: '2026-10-21T10:00:00Z' }

function seededClient(c2LastMessage: typeof message = lastOfC2, c2ClientName: string | null = 'Ana') {
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
          { id: 'c2', client_name: c2ClientName, last_message: c2LastMessage, unread_count: 0 },
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

  it("refetches the list for a client message in a chat whose client's name it doesn't know yet", () => {
    const queryClient = seededClient(lastOfC2, null)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    chatLiveEvents(queryClient).events['message.created']({ chat_id: 'c2', message })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'list'] })
  })

  it("doesn't refetch the list once it knows the client's name, or for a member's message", () => {
    const named = seededClient()
    const unnamed = seededClient(lastOfC2, null)
    const invalidateNamed = vi.spyOn(named, 'invalidateQueries')
    const invalidateUnnamed = vi.spyOn(unnamed, 'invalidateQueries')

    chatLiveEvents(named).events['message.created']({ chat_id: 'c2', message })
    chatLiveEvents(unnamed).events['message.created']({
      chat_id: 'c2',
      message: { ...message, sender_type: 'TENANT_MEMBER', status: 'PENDING' },
    })

    expect(invalidateNamed).not.toHaveBeenCalledWith({ queryKey: ['chats', 'list'] })
    expect(invalidateUnnamed).not.toHaveBeenCalledWith({ queryKey: ['chats', 'list'] })
  })

  it("refetches the inbox and the clients' chats for a message of a chat it doesn't know (a new chat)", () => {
    const queryClient = seededClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    chatLiveEvents(queryClient).events['message.created']({ chat_id: 'c9', message })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'list'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'client'] })
  })

  it.each([
    ['a client message', 'message.created', message],
    ['a failed send', 'message.updated', { ...message, sender_type: 'TENANT_MEMBER', status: 'FAILED' }],
  ] as const)('fetches the chat again for %s: its service window may have changed', (_what, kind, pushed) => {
    const queryClient = seededClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    chatLiveEvents(queryClient).events[kind]({ chat_id: 'c2', message: pushed })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'detail', 'c2'] })
  })

  it.each([
    ["an update of a client's message (its file arrived)", 'message.updated', message],
    ["a member's message", 'message.created', { ...message, sender_type: 'TENANT_MEMBER', status: 'PENDING' }],
    ["the agent's reply being delivered", 'message.updated', { ...message, sender_type: 'AGENT', status: 'DELIVERED' }],
  ] as const)("doesn't fetch the chat again for %s", (_what, kind, pushed) => {
    const queryClient = seededClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    chatLiveEvents(queryClient).events[kind]({ chat_id: 'c2', message: pushed })

    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['chats', 'detail', 'c2'] })
  })

  it('refetches the chat list and every chat on resync', () => {
    const queryClient = seededClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    chatLiveEvents(queryClient).events.resync({})

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'list'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'detail'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chats', 'messages'] })
  })

  it('shows who is writing until they stop, and their reply ends it too', () => {
    const queryClient = seededClient()
    const { events } = chatLiveEvents(queryClient)

    events['chat.typing']({ chat_id: 'c2', member_id: 'ana', expires_in_seconds: 25 })
    events['chat.typing']({ chat_id: 'c2', member_id: null, expires_in_seconds: 60 })
    expect(getChatWriters('c2').map((writer) => writer.memberId)).toEqual(['ana', null])

    events['chat.typing_stopped']({ chat_id: 'c2', member_id: null, expires_in_seconds: 0 })
    events['message.created']({
      chat_id: 'c2',
      message: { ...message, sender_type: 'TENANT_MEMBER', sender_tenant_member_id: 'ana', status: 'PENDING' },
    })
    expect(getChatWriters('c2')).toEqual([])
  })

  it('refetches the team for a reply from a teammate it doesn’t know yet', () => {
    const queryClient = seededClient()
    queryClient.setQueryData(['tenants', 'members'], [{ member_id: 'ana', first_name: 'Ana', last_name: null }])
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const reply = (memberId: string) => ({
      chat_id: 'c2',
      message: { ...message, id: memberId, sender_type: 'TENANT_MEMBER', sender_tenant_member_id: memberId, status: 'PENDING' },
    })

    chatLiveEvents(queryClient).events['message.created'](reply('ana'))
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['tenants', 'members'] })

    chatLiveEvents(queryClient).events['message.created'](reply('new'))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tenants', 'members'] })
  })

  it('needs nothing on reconnect: the server replays the messages', () => {
    expect(chatLiveEvents(new QueryClient()).onReconnect).toBeUndefined()
  })
})
