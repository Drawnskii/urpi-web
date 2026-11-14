import { env } from '@/shared/config'

// The backend's sign-in route (a full page navigation, not a router link): it sends the browser
// to WorkOS, then back to returnTo, a path inside the app. The backend refuses any other place
export function loginUrl(returnTo: string) {
  return `${env.apiUrl}/auth/login?return_to=${encodeURIComponent(returnTo)}`
}
