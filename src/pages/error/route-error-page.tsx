import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { useEffect } from 'react'

import { isApiError } from '@/shared/api'

export function RouteErrorPage({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  // Lets "Try again" re-run the failed query instead of re-throwing the cached error
  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  const title = isApiError(error) && error.isNotFound ? 'Not found' : 'Something went wrong'

  return (
    <div role="alert" className="flex flex-1 flex-col items-start gap-3 p-6">
      <h1>{title}</h1>
      <p>{error instanceof Error ? error.message : String(error)}</p>
      <button type="button" onClick={() => router.invalidate()}>
        Try again
      </button>
    </div>
  )
}
