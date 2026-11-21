import { cn } from '@/shared/lib/utils'

// Animation delays, so the dots bounce in turn
const DELAYS = ['[animation-delay:-0.3s]', '[animation-delay:-0.15s]', '']

// Three dots bouncing in turn, like a chat app's "typing…". Decoration only: the words next to them
// say who is responding. Still, with reduced motion
export function TypingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-0.5">
      {DELAYS.map((delay) => (
        <span key={delay} className={cn('size-1 animate-bounce rounded-full bg-current motion-reduce:animate-none', delay)} />
      ))}
    </span>
  )
}
