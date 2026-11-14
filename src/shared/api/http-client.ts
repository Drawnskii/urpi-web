import { env } from '@/shared/config'

import { ApiError } from './api-error'

type HeadersProvider = () => Record<string, string>
type StreamParamsProvider = () => QueryParams
type UnauthorizedHandler = () => void

let getDefaultHeaders: HeadersProvider = () => ({})
let getStreamParams: StreamParamsProvider = () => ({})
let handleUnauthorized: UnauthorizedHandler = () => {}
let isLeaving = false

// A full page navigation away from the app (signing in or out at the backend and WorkOS). The first
// one wins: requests still in flight answer 401 once the cookie is gone, and their redirect to sign
// in must not replace the navigation already under way. Returns whether this call started it
export function leavePage(url: string) {
  if (isLeaving) return false
  isLeaving = true
  window.location.assign(url)
  return true
}

// Called once by the app layer (src/app/http.ts) to add headers every request needs,
// such as X-Tenant-ID, and the query params every stream needs (EventSource can't send headers).
// onUnauthorized runs on every 401: the session is gone, so the app sends the browser to sign in.
// shared/ never knows where those values come from, or where signing in happens.
export function configureHttp(options: {
  getHeaders: HeadersProvider
  getStreamParams?: StreamParamsProvider
  onUnauthorized?: UnauthorizedHandler
}) {
  getDefaultHeaders = options.getHeaders
  getStreamParams = options.getStreamParams ?? (() => ({}))
  handleUnauthorized = options.onUnauthorized ?? (() => {})
}

type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: QueryParams
  // A 401 is this call's answer, not a lost session: the caller handles it (GET /auth/me asks "signed in?")
  skipUnauthorizedHandler?: boolean
}

export async function http<T>(
  path: string,
  { body, params, headers, skipUnauthorizedHandler = false, ...init }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...getDefaultHeaders(),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data: unknown = response.status === 204 ? undefined : await response.json().catch(() => undefined)

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorizedHandler && !isLeaving) handleUnauthorized()
    throw new ApiError(response.status, data)
  }

  return data as T
}

// The URL for an EventSource: the base URL plus the stream params from configureHttp
export function streamUrl(path: string) {
  return buildUrl(path, getStreamParams())
}

function buildUrl(path: string, params?: QueryParams) {
  const url = `${env.apiUrl}${path}`
  if (!params) return url

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `${url}?${query}` : url
}
