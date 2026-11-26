import { Link } from '@tanstack/react-router'
import { useEffect, useState, type ComponentProps } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRightIcon,
  Calendar,
  GraduationCap,
  MenuIcon,
  Package,
  SparklesIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react'

import { APP_LOGIN_URL } from '@/features/auth'
import { CombinationMark } from '@/shared/components/brand/combination-mark'
import { Button } from '@/shared/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'

interface NavLink {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

const featureLinks: NavLink[] = [
  {
    title: 'Client Support',
    href: '#client-support',
    description: 'Automate inquiries and assist clients 24/7 via WhatsApp.',
    icon: SparklesIcon,
  },
  {
    title: 'Orders',
    href: '#orders',
    description: 'Manage and track customer orders effortlessly.',
    icon: Package,
  },
  {
    title: 'Bookings',
    href: '#bookings',
    description: 'Manage appointments and schedules with your clients.',
    icon: Calendar,
  },
  {
    title: 'Enrollments',
    href: '#enrollments',
    description: 'Handle your courses, registrations, and students.',
    icon: GraduationCap,
  },
]

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = useScroll(10)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 w-full border-b border-transparent bg-transparent transition-colors',
        isScrolled &&
        'border-border bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/80'
      )}
    >
      <nav aria-label="Main navigation" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="justify-self-start">
          <Link to="/" aria-label="Urpi home" className="inline-flex items-center">
            <CombinationMark className="h-11 w-auto overflow-visible text-primary dark:text-sidebar-foreground" />
          </Link>
        </div>

        <NavigationMenu viewport={false} className="hidden justify-self-center font-sans md:flex">
          <NavigationMenuList className="flex-row gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-body-sm font-normal">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent className="left-1/2 -translate-x-1/2 bg-background!">
                <ul className="grid w-lg grid-cols-2 gap-1">
                  {featureLinks.map((item) => (
                    <li key={item.title}>
                      <ListItem {...item} className="hover:bg-muted" />
                    </li>
                  ))}
                </ul>
                <div className="p-2">
                  <p className="text-body-sm text-muted-foreground">
                    Want to see it in action?{' '}
                    <a href={APP_LOGIN_URL} className="font-medium text-foreground hover:underline">
                      Register now
                    </a>
                  </p>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <a href="#pricing" className="rounded-md px-3 py-2 text-body-sm hover:bg-accent">
                  Pricing
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-1 justify-self-end md:flex">
          <GetStartedButton size="lg" variant="secondary" />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <XIcon className="size-6" aria-hidden="true" /> : <MenuIcon className="size-6" aria-hidden="true" />}
          </Button>
        </div>
      </nav>

      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  )
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      id="mobile-menu"
      className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col justify-between overflow-y-auto border-t border-border bg-background/95 font-sans backdrop-blur-lg md:hidden"
    >
      <div className="flex flex-col gap-1 p-4">
        <span className="font-mono text-caption text-muted-foreground uppercase">Features</span>
        <ul className="gap-1">
          {featureLinks.map((link) => (
            <li key={link.title}>
              <a
                href={link.href}
                onClick={onClose}
                className="flex w-full flex-row items-start gap-x-3 rounded-md p-2 transition-colors hover:bg-muted"
              >
                <FeatureLinkBody {...link} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <Separator className="w-full" />
        <div className="flex flex-col gap-1 p-4">
          <GetStartedButton className="w-full" />
        </div>
      </div>
    </div>,
    document.body,
  )
}

function ListItem({ title, description, icon, className, href, ...props }: ComponentProps<typeof NavigationMenuLink> & NavLink) {
  return (
    <NavigationMenuLink
      className={cn(
        'flex w-full flex-row items-start gap-x-3 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...props}
      asChild
    >
      <a href={href}>
        <FeatureLinkBody title={title} description={description} icon={icon} />
      </a>
    </NavigationMenuLink>
  )
}

// A feature's icon, title and description: the inside of its link in both menus
function FeatureLinkBody({ title, description, icon: Icon }: Omit<NavLink, 'href'>) {
  return (
    <>
      <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="text-body-sm font-medium text-foreground">{title}</span>
        <span className="text-caption text-muted-foreground">{description}</span>
      </div>
    </>
  )
}

// Sign up: into the app through sign-in. The header's and the mobile menu's differ only in look
function GetStartedButton(props: Omit<ComponentProps<typeof Button>, 'asChild' | 'children'>) {
  return (
    <Button {...props} asChild>
      <a href={APP_LOGIN_URL}>
        Get Started
        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
      </a>
    </Button>
  )
}

// Whether the page is scrolled past threshold: read on mount, then on each scroll event
function useScroll(threshold: number) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}