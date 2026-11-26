import { Outlet } from '@tanstack/react-router'

import { MarketingFooter } from './marketing-footer'
import { MarketingHeader } from './marketing-header'

// Every marketing page: a header navigation bar over it, and the footer with less relevant pages
export function MarketingLayout() {
  return (
    <>
      <MarketingHeader />
      <Outlet />
      <MarketingFooter />
    </>
  )
}
