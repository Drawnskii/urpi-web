import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

import { BrandMark } from '@/shared/components/brand/brand-mark'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'

// Read once: a render must not call Date (React purity); a year changes rarely enough
const YEAR = new Date().getFullYear()

const footerLinks = [
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
  { label: 'Data Deletion', href: '#data-deletion' },
]

function XIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
    </svg>
  )
}

function InstagramIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3" />
    </svg>
  )
}

function GitHubIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" />
    </svg>
  )
}

const socialLinks = [
  { label: 'Urpi on X', href: 'https://x.com', icon: XIcon },
  { label: 'Urpi on LinkedIn', href: 'https://linkedin.com', icon: LinkedInIcon },
  { label: 'Urpi on Instagram', href: 'https://instagram.com', icon: InstagramIcon },
  { label: 'Urpi on GitHub', href: 'https://github.com', icon: GitHubIcon },
]

export function MarketingFooter() {
  return (
    <footer className="w-full border-t border-border bg-background py-10 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4">
        <Link to="/" aria-label="Urpi home">
          <BrandMark className="h-12 w-auto overflow-visible text-primary dark:text-sidebar-foreground" />
        </Link>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-row flex-wrap items-center justify-center gap-1 font-sans text-body-sm">
            {footerLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ul aria-label="Social media" className="flex flex-row items-center justify-center gap-2">
          {socialLinks.map((social) => (
            <li key={social.label}>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
                <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <social.icon className="size-5" />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Separator className="my-8" />

      <div className="mx-auto flex max-w-6xl justify-center px-4">
        <small className="text-center text-caption text-muted-foreground">
          &copy; {YEAR} Urpi. All rights reserved.
        </small>
      </div>
    </footer>
  )
}