import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { AddTenantForm, tenantQueries } from '@/features/tenants'

// Never "tenant" in the UI: small business owners say "business"
export function OnboardingPage() {
  const { data: tenants } = useSuspenseQuery(tenantQueries.list())

  // A full reload: the new business starts with an empty cache and its own live stream
  function handleAdded() {
    window.location.assign('/whatsapp')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1>Let's set up your business</h1>
        <p className="text-muted-foreground">You'll connect your WhatsApp number next.</p>
      </div>
      <AddTenantForm onAdded={handleAdded} />
      {tenants.length > 0 && (
        <Link to="/chats" className="text-body-sm text-primary underline-offset-4 hover:underline">
          Back to your chats
        </Link>
      )}
    </div>
  )
}
