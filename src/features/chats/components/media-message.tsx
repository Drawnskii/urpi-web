import { FileTextIcon, ImageIcon, MicIcon, MusicIcon, StickerIcon, VideoIcon, type LucideIcon } from 'lucide-react'

import type { MessageOf, ReadyMediaRef } from '../model/chat'
import { documentDetails, mediaStateLabel } from '../model/message-media'
import { FileCard } from './file-card'
import { FileDownloadCard } from './file-download-card'
import { ImageMessage } from './image-message'
import { MediaPlayer } from './media-player'
import { StickerMessage } from './sticker-message'

type MediaMessageType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'STICKER' | 'DOCUMENT'
type FileMessage = MessageOf<MediaMessageType>

interface MediaMessageProps {
  chatId: string
  message: FileMessage
}

// A file the client sent: a card while it downloads (or if it never arrived), then the file itself.
// The caption, when there is one, reads like any text under it; a voice note's transcript is the player's
export function MediaMessage({ chatId, message }: MediaMessageProps) {
  const media = message.payload.media
  const caption = 'caption' in message.payload ? message.payload.caption : null
  const { icon, label } = mediaLabel(message)

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {media.status === 'READY' ? (
        <ReadyFile chatId={chatId} message={message} media={media} icon={icon} label={label} caption={caption} />
      ) : (
        <FileCard icon={icon} label={label} detail={mediaStateLabel(media)} />
      )}
      {caption && <p className="text-body-sm whitespace-pre-wrap wrap-anywhere">{caption}</p>}
    </div>
  )
}

interface ReadyFileProps {
  chatId: string
  message: FileMessage
  media: ReadyMediaRef
  icon: LucideIcon
  label: string
  caption: string | null
}

function ReadyFile({ chatId, message, media, icon, label, caption }: ReadyFileProps) {
  const file = { chatId, messageId: message.id, media }
  switch (message.type) {
    case 'IMAGE':
      return <ImageMessage {...file} caption={caption} />
    case 'STICKER':
      return <StickerMessage {...file} />
    case 'AUDIO':
      return (
        <MediaPlayer {...file} kind="audio" icon={icon} label={label} transcript={message.payload.transcript ?? null} />
      )
    case 'VIDEO':
      return <MediaPlayer {...file} kind="video" icon={icon} label={label} />
    case 'DOCUMENT':
      return (
        <FileDownloadCard
          chatId={chatId}
          messageId={message.id}
          icon={icon}
          label={label}
          detail={documentDetails(message.payload.filename, media)}
        />
      )
  }
}

function mediaLabel(message: FileMessage): { icon: LucideIcon; label: string } {
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
