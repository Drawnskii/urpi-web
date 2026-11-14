import { createFileRoute } from '@tanstack/react-router'

import { AppLayout } from '@/app/layout/app-layout'
import { requireSession } from '@/app/session'

// Pathless layout: every page but /signed-out. Signed in, with a business chosen, before anything loads
export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context, location }) => requireSession(context.queryClient, location),
  component: AppLayout,
})
