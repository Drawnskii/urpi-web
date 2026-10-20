import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </main>
  )
}
