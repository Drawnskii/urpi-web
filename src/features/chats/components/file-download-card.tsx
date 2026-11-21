import { useQueryClient } from '@tanstack/react-query'
import { DownloadIcon, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'

import { chatQueries } from '../api/chat-queries'
import { FileCard } from './file-card'

interface FileDownloadCardProps {
  chatId: string
  messageId: string
  icon: LucideIcon
  label: string
  detail: string
}

// A file to download rather than show: a document, or audio or video this browser can't play. The
// link is fetched only on Download (a cached one is reused). Going to it downloads the file without
// leaving the page: documents are served as attachments, and the browser can't display the others
export function FileDownloadCard({ chatId, messageId, icon, label, detail }: FileDownloadCardProps) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<'idle' | 'pending' | 'failed'>('idle')

  async function download() {
    setState('pending')
    try {
      const link = await queryClient.fetchQuery(chatQueries.mediaLink(chatId, messageId))
      window.location.assign(link.url)
      setState('idle')
    } catch {
      setState('failed')
    }
  }

  return (
    <FileCard icon={icon} label={label} detail={state === 'failed' ? "Couldn't load this file" : detail}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Download ${label}`}
        disabled={state === 'pending'}
        onClick={() => void download()}
      >
        <DownloadIcon aria-hidden="true" />
      </Button>
    </FileCard>
  )
}
