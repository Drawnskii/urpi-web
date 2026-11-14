import { createFileRoute } from '@tanstack/react-router'

import { OnboardingPage } from '@/pages/onboarding/onboarding-page'

// Inside the layout: it needs a signed-in user, not a business
export const Route = createFileRoute('/_app/onboarding')({
  component: OnboardingPage,
})
