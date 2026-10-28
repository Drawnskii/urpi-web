import { Link } from '@tanstack/react-router'

import { Button } from '@/shared/components/ui/button'

export function HomePage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-10 p-6 md:grid-cols-3">
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
        <Button asChild>
          <Link to="/whatsapp">Set up your number</Link>
        </Button>
      </section>

      <section className="flex flex-col items-start gap-3">
        <h2>Message templates</h2>
        <p>Create the messages Meta approves, to write to clients first or after 24 hours.</p>
        <Button asChild>
          <Link to="/templates">Manage templates</Link>
        </Button>
      </section>
    </div>
  )
}
