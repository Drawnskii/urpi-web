import { useMutation, useQueryClient } from '@tanstack/react-query'

import { isApiError } from '@/shared/api'

import type { WhatsAppConnection } from '../model/whatsapp-connection'
import { whatsAppConnectionApi } from './whatsapp-connection-api'
import { whatsAppConnectionKeys } from './whatsapp-connection-queries'

// Named after the backend's use cases. Connect and finish return the connection: it becomes the cached one

function useSaveConnection() {
  const queryClient = useQueryClient()
  return {
    onSuccess: (connection: WhatsAppConnection) =>
      queryClient.setQueryData(whatsAppConnectionKeys.detail(), connection),
    // 409: the tenant is already connected (another tab, another member): show what's there
    onError: (error: Error) => {
      if (isApiError(error) && error.isConflict) {
        return queryClient.invalidateQueries({ queryKey: whatsAppConnectionKeys.detail() })
      }
    },
  }
}

export function useConnectWhatsAppAccount() {
  return useMutation({ mutationFn: whatsAppConnectionApi.connect, ...useSaveConnection() })
}

export function useFinishWhatsAppConnection() {
  return useMutation({ mutationFn: whatsAppConnectionApi.finish, ...useSaveConnection() })
}

// The tenant has no live number afterwards: null, as GET's 404 would say, without a refetch.
// 404: already disconnected (another tab, another member, or Meta): the same
export function useDisconnectWhatsAppAccount() {
  const queryClient = useQueryClient()
  const forget = () => queryClient.setQueryData(whatsAppConnectionKeys.detail(), null)
  return useMutation({
    mutationFn: whatsAppConnectionApi.disconnect,
    onSuccess: forget,
    onError: (error: Error) => {
      if (isApiError(error) && error.isNotFound) forget()
    },
  })
}
