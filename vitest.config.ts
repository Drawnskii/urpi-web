import { fileURLToPath } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

// Tests live in tests/, outside the app (like the backend's tests/): grouped by level, then by the
// path of the code they test. @tests/* reaches shared fakes
export default defineConfig((configEnv) =>
  mergeConfig(viteConfig(configEnv), {
    resolve: {
      alias: {
        '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
      },
    },
    test: {
      include: ['tests/**/*.test.ts'],
    },
  }),
)
