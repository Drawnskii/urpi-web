import { http } from '@/shared/api'

import type { LogoutResult, User } from '../model/user'

export const authApi = {
  // Who is signed in. 401 means "nobody": an answer, so the app's sign-in redirect stays out of it
  me: () => http<User>('/auth/me', { skipUnauthorizedHandler: true }),

  // Deletes the session cookie; the browser goes to logout_url next, so WorkOS ends its session too
  logout: () => http<LogoutResult>('/auth/logout', { method: 'POST' }),
}
