import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { ButtonGroup } from '@/shared/components/ui/button-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

import { chatQueries } from '../api/chat-queries'
import { chatPeriodLabel, type Chat } from '../model/chat'
import { CloseChatButton } from './close-chat-button'

interface ClientChatsPickerProps {
  chat: Chat
}

// The client's chats, newest first: the current one and the closed ones before it. Picking one
// opens it; the button joined to its left closes the chat on screen
export function ClientChatsPicker({ chat }: ClientChatsPickerProps) {
  const navigate = useNavigate()
  // Not suspense: the composer shows at once, with this chat alone until the rest arrives
  const { data: clientChats } = useQuery(chatQueries.clientChats(chat.client_id))
  const chats = clientChats?.some((current) => current.id === chat.id) ? clientChats : [chat]

  function handleChange(chatId: string) {
    void navigate({ to: '/chats/$chatId', params: { chatId } })
  }

  return (
    // Shrinks with the composer's row: the label is cut with … rather than pushing the row wider
    <ButtonGroup className="min-w-0">
      <CloseChatButton chat={chat} />
      <Select value={chat.id} onValueChange={handleChange}>
        <SelectTrigger aria-label="This client's chats" className="min-w-0 font-mono tracking-tight">
          <SelectValue>
            <span className="block truncate">{chatPeriodLabel(chat)}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {chats.map((current) => (
            <SelectItem key={current.id} value={current.id} hasIndicator={false} className="font-mono tracking-tight">
              {chatPeriodLabel(current)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ButtonGroup>
  )
}
