import { TemplateForm, TemplateList } from '@/features/message-templates'

export function TemplatesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <h1>Message templates</h1>
        <p className="text-muted-foreground">
          Templates are the only way to write to a client first, or after 24 hours. Meta reviews each one.
        </p>
      </header>
      <div className="grid gap-10 md:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2>New template</h2>
          <TemplateForm />
        </section>
        <section className="flex flex-col gap-3">
          <h2>Your templates</h2>
          <TemplateList />
        </section>
      </div>
    </div>
  )
}
