import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '@/pages/marketing/home-page'

export const Route = createFileRoute('/_marketing/')({
  component: HomePage,
})
