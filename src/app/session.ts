import type { QueryClient } from '@tanstack/react-query'
import { redirect, type ParsedLocation } from '@tanstack/react-router'

import { authQueries, loginUrl } from '@/features/auth'
import { chooseTenant, getCurrentTenantId, resetCurrentTenant, setCurrentTenant, tenantQueries } from '@/features/tenants'
import { isApiError, leavePage } from '@/shared/api'

// Two trips to sign in this close together mean the backend rejected the session it just issued:
// stop on /signed-out instead of looping (WorkOS would answer too_many_requests)
const LOGIN_LOOP_WINDOW_MS = 15_000
const LOGIN_STARTED_KEY = 'urpi-login-started-at'

// Where the user is now, to come back to after signing in
function currentPath() {
  const { pathname, search, hash } = window.location
  return pathname + search + hash
}

// When the last trip to sign in started, in this tab (sessionStorage: lost with the tab, never shared)
function readLoginStartedAt() {
  try {
    return Number(sessionStorage.getItem(LOGIN_STARTED_KEY)) || 0
  } catch {
    return 0 // blocked storage: no loop protection, but signing in still works
  }
}

function writeLoginStartedAt(at: number) {
  try {
    sessionStorage.setItem(LOGIN_STARTED_KEY, String(at))
  } catch {
    // blocked storage: see readLoginStartedAt
  }
}

// Sends the whole page to the backend's sign-in route (the router only knows the app's own routes).
// Never resolves: nothing should render while the browser leaves
export function redirectToLogin(returnTo: string = currentPath()): Promise<never> {
  const now = Date.now()
  if (now - readLoginStartedAt() < LOGIN_LOOP_WINDOW_MS) {
    leavePage('/signed-out?error=session_rejected')
  } else {
    writeLoginStartedAt(now)
    leavePage(loginUrl(returnTo))
  }
  return new Promise<never>(() => {})
}

// Every page but /signed-out: a signed-in user, and the business they work in.
// Choosing the business here means the page's first request already sends X-Tenant-ID
export async function requireSession(queryClient: QueryClient, location: ParsedLocation) {
  try {
    await queryClient.ensureQueryData(authQueries.me())
  } catch (error) {
    if (isApiError(error) && error.isUnauthorized) return redirectToLogin(location.href)
    throw error
  }

  const tenants = await queryClient.ensureQueryData(tenantQueries.list())
  const chosen = chooseTenant(tenants, getCurrentTenantId())
  if (chosen === null) {
    resetCurrentTenant()
    // No business yet: onboarding creates the first one (it needs a user, not a business)
    if (location.pathname !== '/onboarding') throw redirect({ to: '/onboarding' })
    return
  }
  setCurrentTenant(chosen.tenant_id)
}

// The live stream closed for good. Signed out (the session ended elsewhere)? Then sign in again.
// Otherwise (no longer a member of the business) the pages say the stream ended
export async function checkSessionAfterStreamEnded(queryClient: QueryClient) {
  try {
    await queryClient.fetchQuery({ ...authQueries.me(), staleTime: 0 })
  } catch (error) {
    if (isApiError(error) && error.isUnauthorized) await redirectToLogin()
  }
}
