// Mirrors UserOut (app/modules/auth/api/schemas.py): who is signed in. Their businesses come from GET /tenants
export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

// Mirrors LogoutOut: where the browser goes so WorkOS ends its session too, then back to /signed-out
export interface LogoutResult {
  logout_url: string
}

// The name when WorkOS has one (it's optional at sign-up), else the email
export function userDisplayName(user: User) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return name || user.email
}

// One letter for the avatar
export function userInitial(user: User) {
  return userDisplayName(user).charAt(0).toUpperCase()
}
