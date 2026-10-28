import { HorizontalCombinationMark } from '@/shared/components/brand/horizontal-combination-mark'

// The sidebar's logo: one mark both ways. Expanded (and in the phone sheet), the pigeon and URPI,
// 10px in from the header's edge (centered at 13rem); collapsing, the padding slides to 0 with the rail's
// width (200ms, linear, like the menu's icons), the pigeon lands on the rail's centered 48px square
// and the narrowing rail clips URPI. No state to read.
// The clip reaches 8px past the box (the rail's padding): the link is 47px collapsed, the pigeon
// 48px, and a plain overflow-hidden cut its beak.
// 48px, the most the header fits: the pigeon's eye is drawn small, smaller hides it
export function AppBrand() {
  return (
    <span className="flex min-w-0 pl-2.5 text-primary [clip-path:inset(0_-0.5rem_0_0)] transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:pl-0 dark:text-sidebar-foreground">
      <HorizontalCombinationMark aria-hidden="true" className="h-12 w-auto shrink-0" />
    </span>
  )
}
