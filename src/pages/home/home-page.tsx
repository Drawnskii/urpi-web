import { Link } from '@tanstack/react-router'

import { ConnectWhatsApp } from '@/features/whatsapp-connection'
import { Button } from '@/shared/components/ui/button'

export function HomePage() {
  return (
    <main className="mx-auto grid min-h-svh max-w-4xl content-center gap-10 p-6 md:grid-cols-2">
      <section className="flex flex-col items-start gap-3">
        <h2>Chats</h2>
        <p>Read and answer your clients' WhatsApp conversations.</p>
        <Button asChild>
          <Link to="/chats">Open chats</Link>
        </Button>
      </section>

      <section className="flex flex-col items-start gap-3">
        <h2>WhatsApp number</h2>
        <p>Connect your business's WhatsApp number through Meta.</p>
        <ConnectWhatsApp />
      </section>
    </main>
  )
}
