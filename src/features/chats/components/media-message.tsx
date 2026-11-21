import { FileTextIcon, ImageIcon, MicIcon, MusicIcon, StickerIcon, VideoIcon, type LucideIcon } from 'lucide-react'

import type { MessageOf } from '../model/chat'

type MediaMessageType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'STICKER' | 'DOCUMENT'

interface MediaMessageProps {
  message: MessageOf<MediaMessageType>
}

// A file the client sent. Until files are downloaded (MVP 3.2) and shown (3.3), a card says what it
// is; the caption, when there is one, reads like any text
export function MediaMessage({ message }: MediaMessageProps) {
  const { icon: Icon, label } = mediaLabel(message)
  const caption = 'caption' in message.payload ? message.payload.caption : null

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex min-w-0 items-center gap-2 rounded-md border border-current/15 px-2 py-1.5">
        <Icon aria-hidden="true" className="size-5 shrink-0 opacity-70" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm font-medium">{label}</span>
          <span className="text-caption opacity-70">File available soon</span>
        </div>
      </div>
      {caption && <p className="text-body-sm whitespace-pre-wrap wrap-anywhere">{caption}</p>}
    </div>
  )
}

function mediaLabel(message: MessageOf<MediaMessageType>): { icon: LucideIcon; label: string } {
  switch (message.type) {
    case 'IMAGE':
      return { icon: ImageIcon, label: 'Photo' }
    case 'VIDEO':
      return { icon: VideoIcon, label: 'Video' }
    case 'AUDIO':
      return message.payload.voice ? { icon: MicIcon, label: 'Voice note' } : { icon: MusicIcon, label: 'Audio' }
    case 'STICKER':
      return { icon: StickerIcon, label: 'Sticker' }
    case 'DOCUMENT':
      return { icon: FileTextIcon, label: message.payload.filename ?? 'Document' }
  }
}
