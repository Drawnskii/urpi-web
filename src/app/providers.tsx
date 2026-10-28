import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { TooltipProvider } from '@/shared/components/ui/tooltip'

import { queryClient } from './query-client'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Every shadcn Tooltip needs it above; the sidebar's collapsed icons use them */}
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}
