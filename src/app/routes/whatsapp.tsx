import { createFileRoute } from '@tanstack/react-router'

import { WhatsAppPage } from '@/pages/whatsapp/whatsapp-page'

export const Route = createFileRoute('/whatsapp')({
  component: WhatsAppPage,
})
