import { MoonIcon, SunIcon } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { useTheme, useToggleTheme } from '@/shared/lib'

// Shows what a click switches to: the moon in light mode, the sun in dark mode
export function ThemeToggle() {
  const theme = useTheme()
  const toggleTheme = useToggleTheme()
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label={label} title={label} onClick={toggleTheme}>
      {theme === 'dark' ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
    </Button>
  )
}
