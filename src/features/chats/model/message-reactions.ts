import type { Message, MessageOf } from './chat'

export function isReaction(message: Message): message is MessageOf<'REACTION'> {
  return message.type === 'REACTION'
}

// The emoji each message shows, by the reacted message's id. A client reacts once per message, so
// the newest reaction wins; an empty emoji means they removed it. Takes messages oldest first, as
// the list shows them
export function reactionsByTarget(messages: readonly Message[]): Map<string, string> {
  const reactions = new Map<string, string>()
  for (const message of messages) {
    if (!isReaction(message) || !message.payload.target_message_id) continue
    if (message.payload.emoji) reactions.set(message.payload.target_message_id, message.payload.emoji)
    else reactions.delete(message.payload.target_message_id)
  }
  return reactions
}
