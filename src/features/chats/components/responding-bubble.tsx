import { useRespondingLabel } from '../hooks/use-responding-label'
import { TypingDots } from './typing-dots'

interface RespondingBubbleProps {
  chatId: string
}

// Under the newest message, on the business's side: a bubble of dots with who is writing under it
// ("Ana is responding", "Urpi is responding"), like a reply on its way. Always in the page, empty
// while nobody writes, so screen readers announce it when it appears (output is a live region, and
// one must exist before its content changes)
export function RespondingBubble({ chatId }: RespondingBubbleProps) {
  const label = useRespondingLabel(chatId)

  return (
    // -mt-1 under the list's bottom padding: as far from the last message as a new turn
    <output className="-mt-1 flex flex-col items-end gap-1 px-4 pb-4 empty:hidden">
      {label && (
        <>
          <span className="flex h-9 items-center rounded-xl rounded-br-sm bg-secondary px-4 text-secondary-foreground">
            <TypingDots />
          </span>
          <span className="px-1 text-caption text-muted-foreground">{label}</span>
        </>
      )}
    </output>
  )
}
