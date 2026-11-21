import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { chatApi } from '@/features/chats/api/chat-api'
import { chatKeys, chatQueries } from '@/features/chats/api/chat-queries'

describe('chatQueries.mediaLink', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('is keyed under the chats but outside the messages a resync refetches', () => {
    const key = chatQueries.mediaLink('c', 'm').queryKey
    expect(key.slice(0, chatKeys.all.length)).toEqual([...chatKeys.all])
    expect(key.slice(0, chatKeys.allMessages().length)).not.toEqual([...chatKeys.allMessages()])
  })

  it('reuses a link until a minute before it expires, then fetches a new one', async () => {
    vi.useFakeTimers({ now: Date.parse('2026-11-21T15:00:00Z'), toFake: ['Date'] })
    const getMedia = vi
      .spyOn(chatApi, 'getMedia')
      .mockResolvedValue({ url: 'https://bucket/a', expires_at: '2026-11-21T15:10:00Z' })
    const queryClient = new QueryClient()

    await queryClient.fetchQuery(chatQueries.mediaLink('c', 'm'))
    vi.setSystemTime(Date.parse('2026-11-21T15:08:30Z'))
    await queryClient.fetchQuery(chatQueries.mediaLink('c', 'm'))
    expect(getMedia).toHaveBeenCalledTimes(1)

    vi.setSystemTime(Date.parse('2026-11-21T15:09:30Z'))
    await queryClient.fetchQuery(chatQueries.mediaLink('c', 'm'))
    expect(getMedia).toHaveBeenCalledTimes(2)
    expect(getMedia).toHaveBeenCalledWith('c', 'm')
  })
})
