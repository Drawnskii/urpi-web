import { respondingLabel, typingAuthor } from '../model/message-author'
import { useChatWriters } from '../model/typing-store'
import { useTeam } from './use-team'

// "Ana is responding" while a teammate or the agent writes a reply in the chat; null otherwise
// (and while only the signed-in member writes)
export function useRespondingLabel(chatId: string) {
  const writers = useChatWriters(chatId)
  const team = useTeam()
  return respondingLabel(writers.map((writer) => typingAuthor(writer.memberId, team)))
}
