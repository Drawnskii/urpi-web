import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Skeleton } from '@/shared/components/ui/skeleton'

import { useInView } from '../hooks/use-in-view'
import { useMediaLink } from '../hooks/use-media-link'
import type { ReadyMediaRef } from '../model/chat'
import { fileSize } from '../model/message-media'
import { AudioPlayer, VoiceTranscript } from './audio-player'
import { FileDownloadCard } from './file-download-card'
import { MediaUnavailable } from './media-unavailable'

interface MediaPlayerProps {
  chatId: string
  messageId: string
  kind: 'audio' | 'video'
  media: ReadyMediaRef
  icon: LucideIcon
  label: string // "Voice note", "Audio", "Video": the player's name for screen readers
  transcript?: string | null // a voice note's, folded under its player
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

// The player once the bubble nears the screen: ours for audio, the browser's own for video.
// preload="metadata" reads the duration and a video's first frame, never the whole file. A type the
// browser can't play (AMR, some 3GP) becomes a download instead
export function MediaPlayer({ chatId, messageId, kind, media, icon, label, transcript = null }: MediaPlayerProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const link = useMediaLink(chatId, messageId, inView)

  if (!canPlay(kind, media.mime_type)) {
    const download = (
      <FileDownloadCard chatId={chatId} messageId={messageId} icon={icon} label={label} detail={fileSize(media.size)} />
    )
    return withTranscript(download, transcript)
  }
  if (link.failed) {
    return withTranscript(<MediaUnavailable icon={icon} label={label} onRetry={link.retry} />, transcript)
  }

  return (
    <div
      ref={ref}
      aria-busy={!link.url}
      className={kind === 'video' ? 'aspect-video w-64 max-w-full overflow-hidden rounded-md bg-black' : 'w-72 max-w-full'}
    >
      {!link.url ? (
        <Skeleton className={kind === 'video' ? 'size-full' : 'h-10 w-full'} />
      ) : kind === 'audio' ? (
        <AudioPlayer
          src={link.url}
          label={label}
          transcript={transcript}
          onLoad={link.onMediaLoad}
          onError={link.onMediaError}
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

// Without the player (a type this browser can't play, a file that won't load) the transcript is still
// what the voice note said: shown open under the card, since there's no player to fold it under
function withTranscript(card: ReactNode, transcript: string | null) {
  if (!transcript) return card
  return (
    <div className="flex flex-col gap-1">
      {card}
      <VoiceTranscript text={transcript} />
    </div>
  )
}
