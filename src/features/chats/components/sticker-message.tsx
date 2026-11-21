import { StickerIcon } from 'lucide-react'
import { useState } from 'react'

import { Skeleton } from '@/shared/components/ui/skeleton'

import { useInView } from '../hooks/use-in-view'
import { useMediaLink } from '../hooks/use-media-link'
import type { ReadyMediaRef } from '../model/chat'
import { mediaAspectRatio } from '../model/message-media'
import { MediaUnavailable } from './media-unavailable'

interface StickerMessageProps {
  chatId: string
  messageId: string
  media: ReadyMediaRef
}

// A sticker, small and framed at its ratio before it loads; an animated WebP plays by itself
export function StickerMessage({ chatId, messageId, media }: StickerMessageProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const link = useMediaLink(chatId, messageId, inView)
  const [loaded, setLoaded] = useState(false)

  if (link.failed) return <MediaUnavailable icon={StickerIcon} label="Sticker" onRetry={link.retry} />

  return (
    <div
      ref={ref}
      aria-busy={!loaded}
      className="relative w-32"
      style={{ aspectRatio: mediaAspectRatio(media.width, media.height) }}
    >
      {!loaded && <Skeleton className="absolute inset-0" />}
      {link.url && (
        <img
          src={link.url}
          alt="Sticker"
          width={media.width ?? undefined}
          height={media.height ?? undefined}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setLoaded(true)
            link.onMediaLoad()
          }}
          onError={link.onMediaError}
          className="size-full object-contain"
        />
      )}
    </div>
  )
}
