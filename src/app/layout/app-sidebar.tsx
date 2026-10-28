import { Link, useMatchRoute, type LinkProps } from '@tanstack/react-router'
import { FileTextIcon, MessagesSquareIcon, PhoneIcon, type LucideIcon } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/shared/components/ui/sidebar'

import { AppBrand } from './app-brand'

interface NavItem {
  to: LinkProps['to']
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/chats', label: 'Chats', icon: MessagesSquareIcon },
  { to: '/whatsapp', label: 'WhatsApp number', icon: PhoneIcon },
  { to: '/templates', label: 'Message templates', icon: FileTextIcon },
]

export function AppSidebar() {
  const matchRoute = useMatchRoute()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* A plain link, not a menu button: no hover background, and the logo keeps its own size */}
        <Link
          to="/"
          aria-label="Urpi, home"
          className="flex h-12 items-center rounded-md px-2 outline-hidden ring-sidebar-ring focus-visible:ring-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <AppBrand />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Collapsed, 16px side padding centers the 32px buttons in the 64px rail, under the logo.
            Padding animates with the rail's width (200ms, linear), so the icons slide instead of jumping */}
        <SidebarGroup className="transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:px-4">
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
      <SidebarRail />
    </Sidebar>
  )
}
