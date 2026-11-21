import { RotateCwIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

import { FileCard } from './file-card'

interface MediaUnavailableProps {
  icon: LucideIcon
  label: string
  onRetry: () => void
}

// A file in the bucket the browser couldn't load, even with a new link (offline, blocked, removed)
export function MediaUnavailable({ icon, label, onRetry }: MediaUnavailableProps) {
  return (
    <FileCard icon={icon} label={label} detail="Couldn't load this file">
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Retry loading ${label}`} onClick={onRetry}>
        <RotateCwIcon aria-hidden="true" />
      </Button>
    </FileCard>
  )
}
