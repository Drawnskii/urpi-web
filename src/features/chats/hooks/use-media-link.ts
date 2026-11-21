import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { chatQueries } from '../api/chat-queries'

interface MediaLinkState {
  url: string | undefined
  failed: boolean // the link couldn't be fetched, or the file failed again with a new one
  onMediaLoad: () => void // for the element's load (or loadedmetadata) event
  onMediaError: () => void // for the element's error event
  retry: () => void
}

// The signed link to a READY message's file, fetched once enabled (its bubble is near the viewport).
// A file that fails to load most likely outlived its link: the first error fetches a new one, a
// second in a row gives up until the member retries. A load in between starts the count again, so
// a link that expires much later still renews by itself, and nothing can request links in a loop
export function useMediaLink(chatId: string, messageId: string, enabled: boolean): MediaLinkState {
  const { data, isError, refetch } = useQuery({ ...chatQueries.mediaLink(chatId, messageId), enabled })
  const [errors, setErrors] = useState(0)

  return {
    url: data?.url,
    failed: isError || errors > 1,
    onMediaLoad: () => setErrors(0),
    onMediaError: () => {
      setErrors((count) => count + 1)
      if (errors === 0) void refetch()
    },
    retry: () => {
      setErrors(0)
      void refetch()
    },
  }
}
