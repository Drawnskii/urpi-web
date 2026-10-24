import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { TemplateForm, TemplateList } from '@/features/message-templates'
import { Button } from '@/shared/components/ui/button'

export function TemplatesPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 p-6">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link to="/">
          <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          Home
        </Link>
      </Button>
      <div className="grid gap-10 md:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2>New template</h2>
          <p>Templates are the only way to write to a client first, or after 24 hours. Meta reviews each one.</p>
          <TemplateForm />
        </section>
        <section className="flex flex-col gap-3">
          <h2>Your templates</h2>
          <TemplateList />
        </section>
      </div>
    </main>
  )
}
