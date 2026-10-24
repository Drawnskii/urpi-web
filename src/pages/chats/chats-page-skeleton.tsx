import { Skeleton } from '@/shared/components/ui/skeleton'

// The chats page's layout, with the list as placeholders
export function ChatsPageSkeleton() {
  return (
    <main className="grid h-svh grid-cols-[320px_1fr] grid-rows-[auto_1fr]" aria-busy="true">
      <header className="col-span-2 p-2">
        <Skeleton className="h-8 w-20" />
      </header>
      <aside className="flex flex-col gap-1 p-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </aside>
      <section />
    </main>
  )
}
