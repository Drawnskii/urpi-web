import { createFileRoute } from '@tanstack/react-router'

import { WhatsAppPage } from '@/pages/whatsapp/whatsapp-page'

export const Route = createFileRoute('/_app/whatsapp')({
  component: WhatsAppPage,
})
