import { createFileRoute } from '@tanstack/react-router'

import { MarketingLayout } from '@/app/layout/marketing-layout'

export const Route = createFileRoute('/_marketing')({
  component: MarketingLayout,
})
