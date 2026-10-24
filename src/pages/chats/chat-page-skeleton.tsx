import { Skeleton } from '@/shared/components/ui/skeleton'

// One chat's layout, with the messages and the composer as placeholders
export function ChatPageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true">
      <div className="flex flex-1 flex-col justify-end gap-3 p-4">
        <Skeleton className="h-10 w-1/2 self-start" />
        <Skeleton className="h-10 w-1/3 self-end" />
        <Skeleton className="h-10 w-2/5 self-start" />
      </div>
      <div className="flex items-end gap-2 p-4">
        <Skeleton className="h-16 flex-1" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}
