import type { Message } from '../model/chat'
import { ContactsMessage } from './contacts-message'
import { InteractiveReplyMessage } from './interactive-reply-message'
import { LocationMessage } from './location-message'
import { MediaMessage } from './media-message'

interface MessageBodyProps {
  chatId: string
  message: Message
}

// What a bubble holds, by the message's type. Text, templates, unsupported kinds and any type this
// frontend doesn't know yet show content, which the backend always makes readable
export function MessageBody({ chatId, message }: MessageBodyProps) {
  switch (message.type) {
    case 'IMAGE':
    case 'VIDEO':
    case 'AUDIO':
    case 'STICKER':
    case 'DOCUMENT':
      return <MediaMessage chatId={chatId} message={message} />
    case 'LOCATION':
      return <LocationMessage message={message} />
    case 'CONTACTS':
      return <ContactsMessage message={message} />
    case 'INTERACTIVE':
      return <InteractiveReplyMessage message={message} />
    default:
      // wrap-anywhere: a long word or link with no spaces wraps inside the bubble instead of
      // widening it past 75% and pushing the page sideways
      return <p className="text-body-sm whitespace-pre-wrap wrap-anywhere">{message.content}</p>
  }
}
