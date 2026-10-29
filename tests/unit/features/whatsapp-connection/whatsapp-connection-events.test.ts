import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { whatsAppConnectionLiveEvents } from '@/features/whatsapp-connection/api/whatsapp-connection-events'
import type { WhatsAppConnection } from '@/features/whatsapp-connection/model/whatsapp-connection'

const DETAIL_KEY = ['whatsapp-connection', 'current']

function connection(status: WhatsAppConnection['status'] = 'ACTIVE'): WhatsAppConnection {
  return { account_id: 'a1', waba_id: '102', phone_number_id: '106', phone_number: '+15556635449', status }
}

describe('whatsAppConnectionLiveEvents', () => {
  it('writes the number the server pushed, no request', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(DETAIL_KEY, connection('CONNECTING'))

    whatsAppConnectionLiveEvents(queryClient).events['whatsapp_connection.updated']({ connection: connection('ACTIVE') })

    expect(queryClient.getQueryData<WhatsAppConnection>(DETAIL_KEY)?.status).toBe('ACTIVE')
  })

  it('forgets a number disconnected elsewhere: null, as GET would say', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(DETAIL_KEY, connection())

    whatsAppConnectionLiveEvents(queryClient).events['whatsapp_connection.updated']({ connection: null })

    expect(queryClient.getQueryData(DETAIL_KEY)).toBeNull()
  })

  it('refetches instead when a read is in flight: its older answer would overwrite the push', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(DETAIL_KEY, connection())
    void queryClient.fetchQuery({ queryKey: DETAIL_KEY, queryFn: () => new Promise<WhatsAppConnection>(() => {}) })

    whatsAppConnectionLiveEvents(queryClient).events['whatsapp_connection.updated']({ connection: null })

    expect(queryClient.getQueryData<WhatsAppConnection>(DETAIL_KEY)?.status).toBe('ACTIVE')
    expect(queryClient.getQueryState(DETAIL_KEY)?.isInvalidated).toBe(true)
  })

  it('reads the number again on resync', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(DETAIL_KEY, connection())

    whatsAppConnectionLiveEvents(queryClient).events.resync({})

    expect(queryClient.getQueryState(DETAIL_KEY)?.isInvalidated).toBe(true)
  })

  it('needs nothing on reconnect: the server replays the number if it changed', () => {
    expect(whatsAppConnectionLiveEvents(new QueryClient()).onReconnect).toBeUndefined()
  })
})
