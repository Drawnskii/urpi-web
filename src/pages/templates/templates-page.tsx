import { TemplateForm, TemplateList } from '@/features/message-templates'

export function TemplatesPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-10 p-6 md:grid-cols-2">
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
  )
}
