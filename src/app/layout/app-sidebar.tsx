import { Link, useMatchRoute, useNavigate, type LinkProps } from '@tanstack/react-router'
import { FileTextIcon, MessagesSquareIcon, PhoneIcon, type LucideIcon } from 'lucide-react'

import { UserMenu } from '@/features/auth'
import { TenantSwitcher } from '@/features/tenants'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/shared/components/ui/sidebar'

import { AppBrand } from './app-brand'

interface NavItem {
  to: LinkProps['to']
  label: string
  icon: LucideIcon
}

// Collapsed, 16px side padding centers the 32px buttons in the 64px rail, under the logo.
// Padding animates with the rail's width (200ms, linear), so the icons slide instead of jumping
const RAIL_PADDING = 'transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:px-4'

const NAV_ITEMS: NavItem[] = [
  { to: '/chats', label: 'Chats', icon: MessagesSquareIcon },
  { to: '/whatsapp', label: 'WhatsApp number', icon: PhoneIcon },
  { to: '/templates', label: 'Message templates', icon: FileTextIcon },
]

// Every cached chat and template is the old business's, and the stream is per business: a reload
// starts clean. Switching is rare, so the reload is fine
function handleTenantChange() {
  window.location.assign('/chats')
}

export function AppSidebar() {
  const matchRoute = useMatchRoute()
  const navigate = useNavigate()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* A plain link, not a menu button: no hover background, and the logo keeps its own size. No side
            padding: the pigeon sits at the header's edge, the same place expanded and collapsed */}
        <Link
          to="/dashboard"
          aria-label="Urpi, home"
          className="flex h-12 items-center rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2"
        >
          <AppBrand />
        </Link>
      </SidebarHeader>
      {/* The app's logo is Urpi's; the business the user works in is its own block under it.
          Where the user works first, who they are last (the footer) */}
      <SidebarGroup className={RAIL_PADDING}>
        <TenantSwitcher onTenantChange={handleTenantChange} onNewBusiness={() => void navigate({ to: '/onboarding' })} />
      </SidebarGroup>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <SidebarGroup className={RAIL_PADDING}>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  {/* fuzzy: /chats stays active on /chats/$chatId */}
                  <SidebarMenuButton
                    asChild
                    isActive={Boolean(matchRoute({ to: item.to, fuzzy: true }))}
                    tooltip={item.label}
                  >
                    <Link to={item.to}>
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={RAIL_PADDING}>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
