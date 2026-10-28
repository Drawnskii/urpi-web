import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

// index.html reads this key before the first paint, so the page never flashes the wrong theme
export const THEME_STORAGE_KEY = 'urpi-theme'

// Outside a browser (unit tests import shared/lib) there's no window or document: light, nothing to apply
const isBrowser = typeof window !== 'undefined'

function systemTheme(): Theme {
  if (!isBrowser) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// shadcn's dark variant follows a .dark class on <html> (app/styles/index.css)
function applyTheme(theme: Theme) {
  if (!isBrowser) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

// Light or dark, as the member last chose; the system's until they choose
const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: THEME_STORAGE_KEY, partialize: (state) => ({ theme: state.theme }) },
  ),
)

applyTheme(useThemeStore.getState().theme)
useThemeStore.subscribe((state) => applyTheme(state.theme))

export const useTheme = () => useThemeStore((state) => state.theme)
export const useToggleTheme = () => useThemeStore((state) => state.toggleTheme)
