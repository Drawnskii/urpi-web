import { useMutation, useQueryClient } from '@tanstack/react-query'

import { isApiError } from '@/shared/api'

import type { WhatsAppConnection } from '../model/whatsapp-connection'
import { whatsAppConnectionApi } from './whatsapp-connection-api'
import { whatsAppConnectionKeys } from './whatsapp-connection-queries'

// Named after the backend's use cases. Both return the connection: it becomes the cached one

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
