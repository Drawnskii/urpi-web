import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-6">
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </div>
  )
}
