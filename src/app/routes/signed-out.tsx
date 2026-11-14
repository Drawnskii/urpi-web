import { createFileRoute } from '@tanstack/react-router'

import { SignedOutPage } from '@/pages/signed-out/signed-out-page'

// Where the backend sends the browser after logging out, or when signing in failed.
// session_rejected: the app's own, when the session it just got was refused right away (no loop)
const SIGN_IN_ERRORS = ['sign_in_failed', 'provider_unavailable', 'session_rejected'] as const

type SignInError = (typeof SIGN_IN_ERRORS)[number]

function isSignInError(value: unknown): value is SignInError {
  return SIGN_IN_ERRORS.includes(value as SignInError)
}

interface SignedOutSearch {
  error?: SignInError
}

// Public: outside the _app layout, so no session is needed
export const Route = createFileRoute('/signed-out')({
  validateSearch: (search: Record<string, unknown>): SignedOutSearch => ({
    error: isSignInError(search.error) ? search.error : undefined,
  }),
  component: SignedOutPage,
})
