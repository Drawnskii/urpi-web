import { BrandMark } from '@/shared/components/brand/brand-mark'
import { CombinationMark } from '@/shared/components/brand/combination-mark'

// The sidebar's logo: the combination mark while expanded (and in the phone sheet), the brand
// mark alone when collapsed to icons. CSS on the sidebar's data-collapsible, no state to read.
// 48px both ways, the most the header fits: the pigeon's eye is drawn small, so smaller hides it
export function AppBrand() {
  return (
    <span className="flex items-center text-primary dark:text-sidebar-foreground">
      <CombinationMark aria-hidden="true" className="h-12 w-auto group-data-[collapsible=icon]:hidden" />
      <BrandMark aria-hidden="true" className="hidden size-12 group-data-[collapsible=icon]:block" />
    </span>
  )
}
