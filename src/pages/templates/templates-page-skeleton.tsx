import { Skeleton } from '@/shared/components/ui/skeleton'

// The templates page's layout, with the form and the list as placeholders
export function TemplatesPageSkeleton() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 p-6" aria-busy="true">
      <Skeleton className="h-8 w-20" />
      <div className="grid gap-10 md:grid-cols-2">
        <section className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </section>
        <section className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </section>
      </div>
    </main>
  )
}
