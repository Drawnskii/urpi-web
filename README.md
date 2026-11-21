# urpi-web

Web dashboard for Urpi. React + TypeScript client for the urpi-api backend.

Built on the Vite `react-ts` template, with a feature-driven folder structure, TanStack Router (file-based), TanStack Query, Zustand, Tailwind CSS 4 and shadcn/ui (Radix, Nova preset, Lucide icons).

## Getting started

```bash
pnpm install
cp .env.example .env     # set Meta's app ids
pnpm dev                 # http://localhost:5173
```

The backend (`uvicorn app.main:app --reload`, port 8000) must be running, with its WorkOS settings: every page but `/signed-out` needs a session, and signing in is the backend's route. The dev server proxies `/api/*` to it, so the session cookie is same-origin.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the API (`/api` in dev, through the proxy) |
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
| every page but `/signed-out` | `auth`, `tenants` | Signed in through the backend (WorkOS), or sent to sign in and back. App shell: a sidebar with the business picker, the three sections and the user menu (log out); a sheet on phones |
| `/signed-out` | | Public: logged out, or signing in failed, with a button to sign in |
| `/onboarding` | `tenants` | Create the first business (or another one); the user becomes its owner |
| `/` | | Home: links to chats, WhatsApp number and templates |
| `/chats`, `/chats/$chatId` | `chats` | Inbox (each chat named by a member's title, else the client's WhatsApp name, else "Untitled chat", renamed inline with the pencil; the client's name and number in an info popover; last message, its time and an unread badge per chat, live) and one chat: live messages as bubbles with delivery ticks (long words wrap), grouped by day under a sticky date and by turn (a run of one side's bubbles chained, runs further apart), optimistic replies, read receipts, typing indicator. One row per client: next to the message box, a picker of the client's past (closed) chats, read only, and a button to close the chat, after a confirm dialog |
| `/whatsapp` | `whatsapp-connection` | Connect the business's number through Meta's Embedded Signup; Disconnect it (the owner only), live from any tab or by Meta |
| `/templates` | `message-templates` | Create message templates and follow Meta's review and re-categorizations |

## Brand and theme

- **Tokens** are shadcn's theme variables in `src/app/styles/index.css`: light values in `:root`, dark in `.dark`, exposed as classes (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `font-serif`). Desaturated blue-teal `primary`, lime `secondary`, radius `0.35rem`.
- **Fonts:** Roboto Serif for body text (the default), Work Sans for titles, headings and the sidebar, Fira Mono for labels, badges and small text; from Fontsource, bundled with the app (no Google Fonts request).
- **Type scale:** `text-display`, `text-h1`…`text-h4`, `text-body-lg`, `text-body`, `text-body-sm`, `text-label`, `text-caption` (size, line height and weight); headings, body, labels and `small`/`time` use them by default.
- **Logos:** `HorizontalCombinationMark` (sidebar), `CombinationMark` (stacked, for roomy spaces) and `BrandMark` (favicon) in `src/shared/components/brand/`, drawn in `currentColor`.
- **Lists and tables:** items `gap-1` apart (the spacing token, 0.25rem), set for every `ul`, `ol` and `table` in `index.css`: write no `flex flex-col gap-*` on a list. The one exception: a chat's turns, `gap-3` apart (`message-list.tsx`).
- **Pointer:** everything clickable (buttons, icon buttons, options, menu items, tabs) shows the hand, from one rule in `index.css`; build clickable things from `<button>`.
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
    session.ts         the route guard: signed in, a business chosen; sign in again on a 401
    http.ts            X-Tenant-ID (the current business) on requests and streams, 401 → sign in
    live-events.ts     the app's one live events stream, with each feature's handlers
    layout/            the signed-in layout and the shell: sidebar (logo, business picker, sections, user menu), header with the theme toggle, page area
    route-tree.gen.ts  generated, do not edit
  pages/               route-level screens; compose features, little logic
  features/            one folder per business feature, public API in index.ts
  shared/              generic, feature-agnostic code
    api/               http client, ApiError, the live events stream
    components/ui/     shadcn components
    components/brand/  the logos (BrandMark, CombinationMark, HorizontalCombinationMark)
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
