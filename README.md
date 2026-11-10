# IDICorp Service Console

A responsive React front-end for the IDICorp service: sign in with a CAPTCHA, manage sample
tasks, and try the calculator, text echo and streaming echo. Black-and-yellow theme, keyboard
accessible, standalone (no backend integration).

## Requirements

- Node.js **20.19 or newer** (developed on Node 24)
- npm 10 or newer

## Quick start

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

Sign in with the credentials provided for your environment (the local mock defaults to
`admin` / `admin`).

## Commands

| Command                | What it does                                |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Dev server with API proxy                   |
| `npm run build`        | Production build into `dist/`               |
| `npm run preview`      | Serve the production build locally          |
| `npm test`             | Unit and component tests (Vitest)           |
| `npm run lint`         | Lint (oxlint)                               |
| `npm run format:check` | Check formatting (Prettier); `format` fixes |

## Configuration

Copy `.env.example` to `.env`.

| Variable            | Default               | Purpose                                                               |
| ------------------- | --------------------- | --------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | empty (same origin)   | HTTP API base. Empty uses `/api`, proxied to `https://ts.idicorp.ir`. |
| `VITE_WS_BASE_URL`  | `wss://ts.idicorp.ir` | WebSocket base for `/ws/calculator` and `/ws/echo`.                   |

No secrets are stored in the repository or the app.

## Features

- **Sign in** with the CAPTCHA (refreshable); a failed attempt loads a fresh CAPTCHA.
- **Tasks** (home page): search (debounced, kept in the URL), filter by All / Open / Done, create,
  edit (PUT), toggle completion (PATCH) and delete with confirmation. Each task shows when it
  expires (one hour after its last update). Loading, empty, validation (client and 422), 401, 404,
  503 and network errors all have clear messages.
- **Calculator** over `/ws/calculator`: add, subtract, multiply, divide; connection state, input
  validation that mirrors the service rules, result and history, and the service's error shown.
- **Text echo** over `/ws/echo`: connection state with connect/disconnect, many messages per
  connection, message log.
- **Stream echo**: `POST /api/echo/stream` with text; the response is shown chunk by chunk with
  chunk/byte counts and a cancel button.
- **Accessibility**: skip link, labelled controls, visible focus, keyboard-operable dialogs
  (Radix UI), live regions for status and results, reduced-motion support.
- **Responsive**: works from phone widths up (mobile menu under 768 px).

## Project structure

```
src/
  components/      layout shell and small UI building blocks (Button, Modal, Field, ...)
  features/
    auth/          login + CAPTCHA
    tasks/         API calls, React Query hooks, form schema, page and dialogs
    calculator/    parsing/validation (calc.js) and page
    echo/          text echo page
    stream/        streaming request helper and page
  lib/             api client, config, WebSocket hook, formatting helpers
  routes/          route guard, 404
  stores/          Zustand auth store (token in memory)
netlify/edge-functions/api-proxy.js   same-origin API proxy used in production
```

Adding a feature: create `src/features/<name>/`, add a page, a route in `src/App.jsx` and a nav
entry in `src/components/layout/AppLayout.jsx`. Server calls go through `lib/api.js`; server state
through React Query; shared client state through Zustand.

Stack: React 19, Vite, React Router, Zustand (client state), TanStack Query (server state),
React Hook Form + Zod (forms), Tailwind CSS 4, Radix UI (dialogs), Sonner (toasts).

## Deployment (Netlify)

1. Push this repository to GitHub and import it in Netlify.
2. Leave **Base directory** empty. `netlify.toml` sets the build command (`npm run build`) and
   publish directory (`dist`).
3. Deploy. No environment variables are required.

`netlify.toml` serves `index.html` for every route (client-side routing) and
`netlify/edge-functions/api-proxy.js` forwards `/api/*` to `https://ts.idicorp.ir`.

## Assumptions and notes

- **Same-origin API proxy.** The service sets `session` and `task_session` cookies for its own
  domain. When the app is hosted on another domain those are third-party cookies, which browsers
  commonly block, and every task request would return 401. The dev server and the Netlify edge
  function therefore proxy `/api/*` (stripping the cookie `Domain`) so the cookies are first-party.
  Static assets are still served by the front-end host; only API calls are proxied. To call the
  service directly instead, set `VITE_API_BASE_URL=https://ts.idicorp.ir` (the service must then
  allow your origin with credentials).
- **WebSockets connect directly** to the service. Both flows work without cookies: the calculator
  sends the access token as its first message (within one second), the text echo needs none.
- **Token storage.** The access token is held in memory only, so a page refresh signs the user out.
  This is deliberate: nothing sensitive is written to web storage.
- **Task lifetime.** Tasks expire one hour after creation or last update and every login starts a
  new collection. The UI shows an expiry hint, refetches after every change, and explains empty
  lists and 404s with this in mind. Any 401 signs the user out with a notice.
- **Streaming echo.** The request body is sent in one piece; only the response is streamed.
  Whether chunks arrive progressively depends on the service and any proxy in between.
- **Descriptions.** An empty description is omitted on create and sent as `""` on replace (PUT
  requires the field).
- `GET /api/tasks/{id}` is implemented in the API layer (`features/tasks/api.js`) but the UI works
  from the list, so no screen calls it yet.
