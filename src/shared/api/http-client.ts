import { env } from '@/shared/config'

import { ApiError } from './api-error'

type HeadersProvider = () => Record<string, string>

let getDefaultHeaders: HeadersProvider = () => ({})

// Called once by the app layer (src/app/http.ts) to add headers every request needs,
// such as X-Tenant-ID. shared/ never knows where those values come from.
export function configureHttp(options: { getHeaders: HeadersProvider }) {
  getDefaultHeaders = options.getHeaders
}

type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: QueryParams
}

export async function http<T>(path: string, { body, params, headers, ...init }: RequestOptions = {}): Promise<T> {
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
    throw new ApiError(response.status, data)
  }

  return data as T
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
