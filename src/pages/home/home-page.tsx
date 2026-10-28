import { Link } from '@tanstack/react-router'

import { Button } from '@/shared/components/ui/button'

export function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-display">Welcome to Urpi</h1>
        <p className="text-body-lg text-muted-foreground">Your clients' WhatsApp conversations, in one place.</p>
      </header>
      <div className="grid gap-10 md:grid-cols-3">
        <section className="flex flex-col items-start gap-3">
          <h2 className="text-h3">Chats</h2>
          <p className="text-muted-foreground">Read and answer your clients' WhatsApp conversations.</p>
          <Button asChild>
            <Link to="/chats">Open chats</Link>
          </Button>
        </section>

        <section className="flex flex-col items-start gap-3">
          <h2 className="text-h3">WhatsApp number</h2>
          <p className="text-muted-foreground">Connect your business's WhatsApp number through Meta.</p>
          <Button asChild>
            <Link to="/whatsapp">Set up your number</Link>
          </Button>
        </section>

        <section className="flex flex-col items-start gap-3">
          <h2 className="text-h3">Message templates</h2>
          <p className="text-muted-foreground">Create the messages Meta approves, to write to clients first or after 24 hours.</p>
          <Button asChild>
            <Link to="/templates">Manage templates</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
