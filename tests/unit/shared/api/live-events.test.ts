import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { connectLiveEvents, useLiveEventsStore, type LiveEventsStatus } from '@/shared/api/live-events'

import { FakeEventSource } from '@tests/fakes/event-source'

describe('connectLiveEvents', () => {
  let statuses: LiveEventsStatus[]
  let unsubscribe: () => void

  beforeEach(() => {
    vi.stubGlobal('EventSource', FakeEventSource)
    vi.useFakeTimers()
    statuses = []
    unsubscribe = useLiveEventsStore.subscribe((state) => statuses.push(state.status))
  })

  afterEach(() => {
    unsubscribe()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('calls onFirstReady once, and onReconnect on every later ready', () => {
    const onFirstReady = vi.fn()
    const onReconnect = vi.fn()
    connectLiveEvents({ path: '/events', subscribers: [{ events: {}, onReconnect }], onFirstReady })

    FakeEventSource.last.emit('ready')
    FakeEventSource.last.emit('ready')
    FakeEventSource.last.emit('ready')

    expect(onFirstReady).toHaveBeenCalledTimes(1)
    expect(onReconnect).toHaveBeenCalledTimes(2)
    expect(statuses.at(-1)).toBe('live')
  })

  it('hands each event its parsed data, at the subscriber that names it', () => {
    const onMessage = vi.fn()
    const onTemplate = vi.fn()
    connectLiveEvents({
      path: '/events',
      subscribers: [{ events: { 'message.created': onMessage } }, { events: { 'template.updated': onTemplate } }],
    })

    FakeEventSource.last.emit('template.updated', { id: 't1' })

    expect(onTemplate).toHaveBeenCalledWith({ id: 't1' })
    expect(onMessage).not.toHaveBeenCalled()
  })

  it('reports ended when the server refused the stream', () => {
    connectLiveEvents({ path: '/events', subscribers: [] })
    FakeEventSource.last.fail(FakeEventSource.CLOSED)
    expect(statuses.at(-1)).toBe('ended')
  })

  it('reports reconnecting only when a reconnection takes longer than usual', () => {
    connectLiveEvents({ path: '/events', subscribers: [] })
    FakeEventSource.last.fail(FakeEventSource.CONNECTING)

    vi.advanceTimersByTime(5000)
    expect(statuses).not.toContain('reconnecting')

    vi.advanceTimersByTime(5000)
    expect(statuses.at(-1)).toBe('reconnecting')
  })

  it('cancels the reconnecting notice when the stream is back in time', () => {
    connectLiveEvents({ path: '/events', subscribers: [] })
    FakeEventSource.last.fail(FakeEventSource.CONNECTING)
    FakeEventSource.last.emit('ready')

    vi.advanceTimersByTime(10000)
    expect(statuses).not.toContain('reconnecting')
  })

  it('closes the stream when disconnected', () => {
    const close = connectLiveEvents({ path: '/events', subscribers: [] })
    close()
    expect(FakeEventSource.last.readyState).toBe(FakeEventSource.CLOSED)
  })
})
