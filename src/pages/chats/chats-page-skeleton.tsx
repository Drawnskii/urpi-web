import { Skeleton } from '@/shared/components/ui/skeleton'

// The chats page's layout, with the list as placeholders
export function ChatsPageSkeleton() {
  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]"
      aria-busy="true"
    >
      <aside className="flex flex-col gap-1 p-2 lg:border-r">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </aside>
      <section className="hidden lg:block" />
    </div>
  )
}
