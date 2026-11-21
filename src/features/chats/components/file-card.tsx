import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface FileCardProps {
  icon: LucideIcon
  label: string // the file's name or kind ("Voice note"), cut with … when long
  detail: string // the line under it: its state or its size
  children?: ReactNode // an action at the end (Download, Retry)
}

// A file shown as a card instead of its content: while it downloads, when it can't be shown, or a document
export function FileCard({ icon: Icon, label, detail, children }: FileCardProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-current/15 px-2 py-1.5">
      <Icon aria-hidden="true" className="size-5 shrink-0 opacity-70" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-sm font-medium" title={label}>
          {label}
        </span>
        <span className="text-caption opacity-70">{detail}</span>
      </div>
      {children}
    </div>
  )
}
