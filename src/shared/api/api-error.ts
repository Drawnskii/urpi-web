// FastAPI validation error item (422 from request parsing, before any use case runs)
export interface ValidationIssue {
  loc: (string | number)[]
  msg: string
  type: string
}

// Every non-2xx response becomes an ApiError.
// Domain errors arrive as { detail: string, error: 'IntentionNotFoundError' };
// request validation errors as { detail: ValidationIssue[] }.
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly issues: ValidationIssue[]

  constructor(status: number, body: unknown) {
    const detail = isRecord(body) ? body.detail : undefined
    const message = typeof detail === 'string' ? detail : `Request failed with status ${status}`
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = isRecord(body) && typeof body.error === 'string' ? body.error : null
    this.issues = Array.isArray(detail) ? (detail as ValidationIssue[]) : []
  }

  get isNotFound() {
    return this.status === 404
  }

  get isConflict() {
    return this.status === 409
  }

  get isUnprocessable() {
    return this.status === 422
  }

  // An upstream service failed (for example Meta), not the request: retrying may work
  get isBadGateway() {
    return this.status === 502
  }
}

// 422 issues keyed by field: loc ['body', 'adjective'] -> { adjective: 'Field required' }
export function fieldErrorsFrom(error: ApiError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = issue.loc.at(-1)
    if (typeof field === 'string') fieldErrors[field] ??= issue.msg
  }
  return fieldErrors
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
