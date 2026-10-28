import type { CSSProperties, ReactNode } from 'react'

import { Separator } from '@/shared/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/components/ui/sidebar'

import { AppSidebar } from './app-sidebar'
import { ThemeToggle } from './theme-toggle'

interface AppShellProps {
  children: ReactNode
}

// Every page: the sidebar (a sheet on phones) and the page in the inset, which scrolls on its own
export function AppShell({ children }: AppShellProps) {
  return (
    // Narrower than shadcn's 16rem when open (the longest label is "Message templates"); wider than
    // its 3rem when collapsed, so the logo can be 48px: at that size the pigeon's eye is ~1px
    <SidebarProvider style={{ '--sidebar-width': '13rem', '--sidebar-width-icon': '4rem' } as CSSProperties}>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="flex h-12 shrink-0 items-center border-b">
          {/* Each button centered in its own 48px square: equal space on both sides */}
          <div className="flex size-12 shrink-0 items-center justify-center">
            <SidebarTrigger />
          </div>
          {/* Stretches to the header's full height (the separator's default) */}
          <Separator orientation="vertical" />
          <div className="ml-auto flex size-12 shrink-0 items-center justify-center">
            <ThemeToggle />
          </div>
        </header>
        {/* Each page's root takes flex-1 to fill it top to bottom; long pages scroll here */}
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
