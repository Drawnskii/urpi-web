# urpi-web

Web dashboard for Urpi. React + TypeScript client for the urpi-api backend.

Built on the Vite `react-ts` template, with a feature-driven folder structure, TanStack Router (file-based), TanStack Query, Zustand, Tailwind CSS 4 and shadcn/ui (Radix, Nova preset, Lucide icons).

## Getting started

```bash
pnpm install
cp .env.example .env     # set VITE_TENANT_ID, VITE_TENANT_MEMBER_ID (a member of that tenant) and Meta's app ids
pnpm dev                 # http://localhost:5173
```

The backend (`uvicorn app.main:app --reload`, port 8000) must be running: every page uses it. The dev server proxies `/api/*` to it.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the API (`/api` in dev, through the proxy) |
| `VITE_TENANT_ID`, `VITE_TENANT_MEMBER_ID` | Sent as `X-Tenant-ID` / `X-Tenant-Member-ID` (and in the stream's URL) until authentication exists |
| `VITE_WHATSAPP_APP_ID`, `VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID` | Meta's app and Embedded Signup configuration, for "Connect WhatsApp". Public, never the app secret |
| `VITE_WHATSAPP_GRAPH_API_VERSION` | Graph API version for Meta's SDK (default `v25.0`) |
| `API_PROXY_TARGET` | Dev server only: where `/api` goes (default `http://localhost:8000`) |

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Start the dev server                         |
| `pnpm build`     | Generate routes, typecheck, build to `dist/` |
| `pnpm typecheck` | Generate routes, run `tsc -b`                |
| `pnpm routes`    | Regenerate `src/app/route-tree.gen.ts`       |
| `pnpm lint`      | Run oxlint (`pnpm lint:fix` to fix)          |
| `pnpm preview`   | Preview the production build                 |
| `pnpm test`      | Run the unit tests (Vitest)                  |

## Features

| Route | Feature | What it does |
| --- | --- | --- |
| every page | | App shell: a sidebar with the three sections (a sheet on phones) |
| `/` | | Home: links to chats, WhatsApp number and templates |
| `/chats`, `/chats/$chatId` | `chats` | Inbox and one chat: live messages, optimistic replies, read receipts, typing indicator |
| `/whatsapp` | `whatsapp-connection` | Connect the tenant's number through Meta's Embedded Signup; disabled once connected |
| `/templates` | `message-templates` | Create message templates and follow Meta's review and re-categorizations |

## Brand and theme

- **Tokens** are shadcn's theme variables in `src/app/styles/index.css`: light values in `:root`, dark in `.dark`, exposed as classes (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `font-serif`). Desaturated blue-teal `primary`, lime `secondary`, radius `0.35rem`.
- **Fonts:** Roboto Serif for body text (the default), Work Sans for titles, headings and the sidebar, Fira Mono for labels, badges and small text; from Fontsource, bundled with the app (no Google Fonts request).
- **Type scale:** `text-display`, `text-h1`…`text-h4`, `text-body-lg`, `text-body`, `text-body-sm`, `text-label`, `text-caption` (size, line height and weight); headings, body, labels and `small`/`time` use them by default.
- **Logos:** `CombinationMark` (expanded sidebar) and `BrandMark` (collapsed sidebar, favicon) in `src/shared/components/brand/`, drawn in `currentColor`.
- **Light/dark:** the toggle at the right of the header; saved in `localStorage`, the system's until chosen, applied before the first paint.
- Use roles, never raw colors, and give every new color a dark value. Details in the guide, section 6.

## Architecture (feature-driven)

```
src/
  app/                 bootstrap and wiring, knows about everything
    routes/            TanStack Router file routes (thin: loader + page component)
    styles/            global CSS: Tailwind, the brand theme (light and dark) and its fonts
    app.tsx            Providers + RouterProvider
    router.ts          router instance, type registration
    query-client.ts    QueryClient defaults
    providers.tsx      QueryClientProvider, TooltipProvider
    http.ts            default request headers and stream params (tenant, member)
    live-events.ts     the app's one live events stream, with each feature's handlers
    layout/            the app shell: sidebar (with the logo), header with the theme toggle, page area
    route-tree.gen.ts  generated, do not edit
  pages/               route-level screens; compose features, little logic
  features/            one folder per business feature, public API in index.ts
  shared/              generic, feature-agnostic code
    api/               http client, ApiError, the live events stream
    components/ui/     shadcn components
    components/brand/  the logos (BrandMark, CombinationMark)
    config/            env
    hooks/  lib/  types/   lib/ holds the theme store (light/dark)
tests/                 outside the app, like the backend: by level, then the tested path
  unit/                pure logic (Vitest)
  fakes/               shared test doubles, imported as @tests/fakes/...
```

Dependencies only flow downward: `app → pages → features → shared`. Oxlint (`.oxlintrc.json`) enforces it:

- `shared/` cannot import from `features/`, `pages/` or `app/`.
- `features/` cannot import from `pages/` or `app/`.
- Features are imported only through their public API (`@/features/<name>`), never `@/features/<name>/components/...`. Inside a feature, use relative imports.

## Data fetching and routing

- Each feature exposes `queryOptions` / `infiniteQueryOptions` factories from its `api/` folder.
- Route loaders prefetch with `context.queryClient.ensureQueryData(...)` (or `ensureInfiniteQueryData`); pages read with `useSuspenseQuery(...)` (or `useSuspenseInfiniteQuery`) using the same options.
- Server changes arrive over one SSE stream (`GET /events`), opened in the root route. Each feature handles its own events (`message.created`, `template.updated`…) by writing into the query cache: no polling. After a reconnection the server replays what was missed.
- Routes live in `src/app/routes`. The Vite plugin regenerates the route tree in dev; `pnpm routes` does it manually. Route config is in `tsr.config.json`.
- Environment variables go in `.env` (see `.env.example`) and are typed in `src/env.d.ts`.
- Oxlint runs `@tanstack/eslint-plugin-query` (for example, query keys must include every dependency).

The full guide is `docs/development-guide.md` (local, not in git).
