import type { ComponentProps } from 'react'

// What every Urpi logo shares: colored with currentColor (set it with a text class, text-primary), sized
// by height (h-8 w-auto), named by its <title>; pass aria-hidden="true" where something next to it
// already names it. Each logo gives its own viewBox and paths
export interface BrandLogoProps extends ComponentProps<'svg'> {
  title?: string
}

export function BrandLogo({ title = 'Urpi', children, ...props }: BrandLogoProps) {
  return (
    <svg fill="currentColor" fillRule="evenodd" clipRule="evenodd" {...props}>
      <title>{title}</title>
      {children}
    </svg>
  )
}
