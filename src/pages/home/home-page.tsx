import { Link } from '@tanstack/react-router'

import { ConnectWhatsApp } from '@/features/whatsapp-connection'
import { Button } from '@/shared/components/ui/button'

export function HomePage() {
  return (
    <main className="mx-auto grid min-h-svh max-w-6xl content-center gap-10 p-6 md:grid-cols-3">
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

      <section className="flex flex-col items-start gap-3">
        <h2>Message templates</h2>
        <p>Create the messages Meta approves, to write to clients first or after 24 hours.</p>
        <Button asChild>
          <Link to="/templates">Manage templates</Link>
        </Button>
      </section>
    </main>
  )
}
