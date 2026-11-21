import type { LucideIcon } from 'lucide-react'

import { Skeleton } from '@/shared/components/ui/skeleton'

import { useInView } from '../hooks/use-in-view'
import { useMediaLink } from '../hooks/use-media-link'
import type { ReadyMediaRef } from '../model/chat'
import { fileSize } from '../model/message-media'
import { FileDownloadCard } from './file-download-card'
import { MediaUnavailable } from './media-unavailable'

interface MediaPlayerProps {
  chatId: string
  messageId: string
  kind: 'audio' | 'video'
  media: ReadyMediaRef
  icon: LucideIcon
  label: string // "Voice note", "Audio", "Video": the player's name for screen readers
}

// Per kind and type: whether this browser plays it ('' from canPlayType: it can't)
const playable = new Map<string, boolean>()

function canPlay(kind: MediaPlayerProps['kind'], mimeType: string): boolean {
  const key = `${kind} ${mimeType}`
  let can = playable.get(key)
  if (can === undefined) {
    can = document.createElement(kind).canPlayType(mimeType) !== ''
    playable.set(key, can)
  }
  return can
}

// The browser's own player once the bubble nears the screen. preload="metadata" reads the duration
// and a video's first frame, never the whole file. A type the browser can't play (AMR, some 3GP)
// becomes a download instead
export function MediaPlayer({ chatId, messageId, kind, media, icon, label }: MediaPlayerProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const link = useMediaLink(chatId, messageId, inView)

  if (!canPlay(kind, media.mime_type)) {
    return <FileDownloadCard chatId={chatId} messageId={messageId} icon={icon} label={label} detail={fileSize(media.size)} />
  }
  if (link.failed) return <MediaUnavailable icon={icon} label={label} onRetry={link.retry} />

  return (
    <div
      ref={ref}
      aria-busy={!link.url}
      className={kind === 'video' ? 'aspect-video w-64 max-w-full overflow-hidden rounded-md bg-black' : 'w-64 max-w-full'}
    >
      {!link.url ? (
        <Skeleton className={kind === 'video' ? 'size-full' : 'h-12 w-full'} />
      ) : kind === 'audio' ? (
        // Clients' recordings have no captions; the transcript joins the bubble in MVP 3.4
        // oxlint-disable-next-line jsx-a11y/media-has-caption
        <audio
          src={link.url}
          controls
          preload="metadata"
          aria-label={label}
          onLoadedMetadata={link.onMediaLoad}
          onError={link.onMediaError}
          className="w-full"
        />
      ) : (
        // oxlint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={link.url}
          controls
          playsInline
          preload="metadata"
          aria-label={label}
          onLoadedMetadata={link.onMediaLoad}
          onError={link.onMediaError}
          className="size-full object-contain"
        />
      )}
    </div>
  )
}
