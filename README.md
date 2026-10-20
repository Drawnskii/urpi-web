# urpi-web

Web dashboard for Urpi. React + TypeScript client for the urpi-api backend.

Built on the Vite `react-ts` template, with a feature-driven folder structure, TanStack Router (file-based), TanStack Query and Zustand.

## Getting started

```bash
pnpm install
cp .env.example .env     # set VITE_TENANT_ID and VITE_TENANT_MEMBER_ID (a member of that tenant)
pnpm dev                 # http://localhost:5173
```

The backend (`uvicorn app.main:app --reload`, port 8000) must be running for pages that load data. The dev server proxies `/api/*` to it.

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Start the dev server                         |
| `pnpm build`     | Generate routes, typecheck, build to `dist/` |
| `pnpm typecheck` | Generate routes, run `tsc -b`                |
| `pnpm routes`    | Regenerate `src/app/route-tree.gen.ts`       |
| `pnpm lint`      | Run oxlint (`pnpm lint:fix` to fix)          |
| `pnpm preview`   | Preview the production build                 |

## Architecture (feature-driven)

```
src/
  app/                 bootstrap and wiring, knows about everything
    routes/            TanStack Router file routes (thin: loader + page component)
    styles/            global CSS
    app.tsx            Providers + RouterProvider
    router.ts          router instance, type registration
    query-client.ts    QueryClient defaults
    providers.tsx      QueryClientProvider
    http.ts            default request headers (X-Tenant-ID)
    route-tree.gen.ts  generated, do not edit
  pages/               route-level screens; compose features, little logic
  features/            one folder per business feature, public API in index.ts
  shared/              generic, feature-agnostic code
    api/               http client and ApiError
    config/            env
    components/  hooks/  lib/  types/
```

Dependencies only flow downward: `app → pages → features → shared`. Oxlint (`.oxlintrc.json`) enforces it:

- `shared/` cannot import from `features/`, `pages/` or `app/`.
- `features/` cannot import from `pages/` or `app/`.
- Features are imported only through their public API (`@/features/<name>`), never `@/features/<name>/components/...`. Inside a feature, use relative imports.

## Data fetching and routing

- Each feature exposes `queryOptions` factories from its `api/` folder.
- Route loaders prefetch with `context.queryClient.ensureQueryData(...)`; pages read with `useSuspenseQuery(...)` using the same options.
- Routes live in `src/app/routes`. The Vite plugin regenerates the route tree in dev; `pnpm routes` does it manually. Route config is in `tsr.config.json`.
- Environment variables go in `.env` (see `.env.example`) and are typed in `src/env.d.ts`.
- Oxlint runs `@tanstack/eslint-plugin-query` (for example, query keys must include every dependency).
