import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/components/ui/sidebar'

import { tenantQueries } from '../api/tenant-queries'
import { useCurrentTenant } from '../hooks/use-current-tenant'
import { setCurrentTenant } from '../model/current-tenant-store'
import { roleLabel, tenantInitial, type UserTenant } from '../model/tenant'

interface TenantSwitcherProps {
  // The new business is remembered already. Every cached chat and template is the old business's,
  // and the live stream is per business: the app reloads to start clean
  onTenantChange: (tenantId: string) => void
  onNewBusiness: () => void
}

interface TenantMarkProps {
  tenant: UserTenant
  className: string
}

// The business's initial in a square: its logo, until businesses have one
function TenantMark({ tenant, className }: TenantMarkProps) {
  return (
    <span aria-hidden="true" className={className}>
      {tenantInitial(tenant)}
    </span>
  )
}

// shadcn's sidebar-07 team switcher: which business the user is working in, the others, and a way
// to add one. Collapsed, only the current business's initial shows
export function TenantSwitcher({ onTenantChange, onNewBusiness }: TenantSwitcherProps) {
  const { data: tenants } = useSuspenseQuery(tenantQueries.list())
  const current = useCurrentTenant()
  const { isMobile } = useSidebar()

  function handleSelect(selectedId: string) {
    if (selectedId === current?.tenant_id) return
    setCurrentTenant(selectedId)
    onTenantChange(selectedId)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={current?.name ?? 'Business'}
              aria-label={current ? `Business: ${current.name}. Switch business` : 'Choose a business'}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {current ? (
                <TenantMark
                  tenant={current}
                  className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-heading text-sidebar-primary-foreground"
                />
              ) : (
                <span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg border border-dashed">
                  <PlusIcon aria-hidden="true" />
                </span>
              )}
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading font-medium">{current?.name ?? 'No business yet'}</span>
                {current && <span className="truncate font-mono text-caption">{roleLabel(current.role)}</span>}
              </span>
              <ChevronsUpDownIcon aria-hidden="true" className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="text-caption text-muted-foreground">Businesses</DropdownMenuLabel>
            {tenants.map((tenant) => (
              <DropdownMenuItem key={tenant.tenant_id} onSelect={() => handleSelect(tenant.tenant_id)} className="gap-2 p-2">
                <TenantMark
                  tenant={tenant}
                  className="flex size-6 shrink-0 items-center justify-center rounded-md border font-heading text-caption"
                />
                <span className="truncate">{tenant.name}</span>
                {tenant.tenant_id === current?.tenant_id && <CheckIcon aria-label="Current" className="ml-auto" />}
              </DropdownMenuItem>
            ))}
            {tenants.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={onNewBusiness} className="gap-2 p-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon aria-hidden="true" className="size-4" />
              </span>
              <span className="font-medium text-muted-foreground">Add business</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
