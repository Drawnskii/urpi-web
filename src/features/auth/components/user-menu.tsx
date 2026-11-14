import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/components/ui/sidebar'

import { useLogout } from '../api/auth-mutations'
import { authQueries } from '../api/auth-queries'
import { userDisplayName, userInitial, type User } from '../model/user'

interface UserSummaryProps {
  user: User
}

// Avatar, name and email: on the trigger and again at the top of the menu
function UserSummary({ user }: UserSummaryProps) {
  return (
    <>
      <Avatar className="size-8 rounded-lg after:rounded-lg">
        <AvatarFallback className="rounded-lg">{userInitial(user)}</AvatarFallback>
      </Avatar>
      <span className="grid flex-1 text-left leading-tight">
        <span className="truncate font-heading font-medium">{userDisplayName(user)}</span>
        <span className="truncate font-mono text-caption">{user.email}</span>
      </span>
    </>
  )
}

// shadcn's sidebar-07 nav user: who is signed in, at the bottom of the sidebar, and logging out
export function UserMenu() {
  const { data: user } = useSuspenseQuery(authQueries.me())
  const logout = useLogout()
  const { isMobile } = useSidebar()

  function handleLogoutSelect(event: Event) {
    // Keep the menu open: it says "Logging out…" until the browser leaves for WorkOS
    event.preventDefault()
    logout.mutate()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={userDisplayName(user)}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserSummary user={user} />
              <ChevronsUpDownIcon aria-hidden="true" className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left">
                <UserSummary user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={logout.isPending} onSelect={handleLogoutSelect}>
              <LogOutIcon aria-hidden="true" />
              {logout.isPending ? 'Logging out…' : 'Log out'}
            </DropdownMenuItem>
            {logout.isError && (
              <p role="alert" className="px-2 py-1 text-body-sm text-destructive">
                Couldn't log out. Try again.
              </p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
