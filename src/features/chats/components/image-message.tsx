import { ImageIcon } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Skeleton } from '@/shared/components/ui/skeleton'

import { useInView } from '../hooks/use-in-view'
import { useMediaLink } from '../hooks/use-media-link'
import type { ReadyMediaRef } from '../model/chat'
import { mediaAspectRatio } from '../model/message-media'
import { MediaUnavailable } from './media-unavailable'

interface ImageMessageProps {
  chatId: string
  messageId: string
  media: ReadyMediaRef
  caption: string | null
}

// A photo in its bubble, framed at its own ratio before it loads (the list doesn't jump). Its link
// is fetched as it nears the screen; a click opens it whole in a dialog
export function ImageMessage({ chatId, messageId, media, caption }: ImageMessageProps) {
  const [ref, inView] = useInView<HTMLButtonElement>()
  const link = useMediaLink(chatId, messageId, inView)
  const [loaded, setLoaded] = useState(false)

  if (link.failed) return <MediaUnavailable icon={ImageIcon} label="Photo" onRetry={link.retry} />

  const alt = caption ?? 'Photo'
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label="Open photo"
          aria-busy={!loaded}
          disabled={!link.url}
          className="relative w-64 max-w-full overflow-hidden rounded-md"
          style={{ aspectRatio: mediaAspectRatio(media.width, media.height) }}
        >
          {!loaded && <Skeleton className="absolute inset-0" />}
          {link.url && (
            <img
              src={link.url}
              alt={alt}
              width={media.width ?? undefined}
              height={media.height ?? undefined}
              loading="lazy"
              decoding="async"
              onLoad={() => {
                setLoaded(true)
                link.onMediaLoad()
              }}
              onError={link.onMediaError}
              className="size-full object-cover"
            />
          )}
        </button>
      </DialogTrigger>
      {/* Without a caption there's no description: say so, or Radix warns */}
      <DialogContent className="max-h-svh gap-2 p-2 sm:max-w-3xl" {...(!caption && { 'aria-describedby': undefined })}>
        <DialogTitle className="sr-only">Photo</DialogTitle>
        <img src={link.url} alt={alt} className="max-h-[85svh] w-full rounded-md object-contain" />
        {caption && <DialogDescription className="px-1 whitespace-pre-wrap wrap-anywhere">{caption}</DialogDescription>}
      </DialogContent>
    </Dialog>
  )
}
