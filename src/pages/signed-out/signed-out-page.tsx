import { getRouteApi } from '@tanstack/react-router'

import { loginUrl } from '@/features/auth'
import { CombinationMark } from '@/shared/components/brand/combination-mark'
import { Button } from '@/shared/components/ui/button'

const route = getRouteApi('/signed-out')

const MESSAGES = {
  none: { title: "You're logged out", text: 'Sign in to get back to your chats.', action: 'Sign in' },
  sign_in_failed: { title: "Signing in didn't work", text: 'It was cancelled or took too long.', action: 'Try again' },
  provider_unavailable: {
    title: "Signing in didn't work",
    text: "The sign-in service didn't answer. Wait a moment and try again.",
    action: 'Try again',
  },
  session_rejected: {
    title: "Signing in didn't stick",
    text: "Your sign-in was refused right after it finished. Wait a moment and try again; if it keeps happening, tell us.",
    action: 'Try again',
  },
} as const

// Public: no shell, no session. Also where a failed sign-in lands. Outside the shell there's no
// inset to be the page's <main>, so the page is its own
export function SignedOutPage() {
  const { error } = route.useSearch()
  const message = MESSAGES[error ?? 'none']

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <CombinationMark className="h-12 w-auto text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1>{message.title}</h1>
        <p className="text-muted-foreground">{message.text}</p>
      </div>
      {/* A full page navigation: signing in is the backend's route, not the router's */}
      <Button asChild>
        <a href={loginUrl('/')}>{message.action}</a>
      </Button>
    </main>
  )
}
