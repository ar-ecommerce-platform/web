# web

Storefront web client for **ar-ecommerce-platform** — a Next.js 15 (App Router)
front end for the microservices backend.

## What it does

Register / sign in → browse the seeded catalog → product detail with live stock →
client-side cart → checkout (`POST /api/orders`, which orchestrates inventory +
payment + notification) → order history with payment and notification status.
It's the browser version of `infra/scripts/demo-flow`.

## How auth works (the BFF pattern)

The browser **never** holds the JWT and **never** calls the platform directly.

1. `POST /api/auth/login` (a route handler in this app) forwards credentials to
   the gateway, gets the JWT back, and stores it in an **httpOnly, SameSite=Lax**
   cookie. JavaScript can't read it → no XSS token theft.
2. Every subsequent call goes to this app's own `/api/bff/*` route handlers,
   which read the cookie server-side and attach `Authorization: Bearer …` before
   forwarding to the gateway. No CORS, no token in `localStorage`.
3. `middleware.ts` cheaply gates `/cart`, `/checkout`, `/orders` on a present,
   unexpired cookie; the gateway still does real validation on every request.

"Sign in with Microsoft" (Entra ID) is stubbed — the button appears when
`NEXT_PUBLIC_ENTRA_CLIENT_ID` is set and is wired up once the app registration
exists.

## Run it

```bash
cp .env.example .env.local          # GATEWAY_URL defaults to http://localhost:8080
npm install
npm run dev                         # http://localhost:3000
```

The platform must be up (`docker compose -f infra/compose/docker-compose.yml up -d`
in the `infra` repo). The gateway's CORS list already includes
`http://localhost:3000`, though the browser only ever talks to this app.

## Scripts

| command | what |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | production build (standalone output) / serve it |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` / `format:check` | Prettier |

## Layout

```
src/
  middleware.ts              auth gate for /cart, /checkout, /orders
  lib/
    api.ts                   the one server-side client for the gateway
    session.ts               httpOnly cookie read/write
    jwt.ts                   unverified payload reader (UI only)
    types.ts  format.ts  cn.ts
  app/
    page.tsx                 catalog (server component)
    products/[id]/page.tsx   detail + stock
    login/  register/  cart/  checkout/  orders/
    api/
      auth/{login,register,logout}/route.ts   set/clear the session cookie
      bff/checkout/route.ts                   places an order (userId from session)
      bff/[...path]/route.ts                  allow-listed authenticated proxy
  components/
    nav.tsx  product-card.tsx  add-to-cart.tsx
    cart-provider.tsx         client cart context (localStorage)
    ui/                       button, input
```

## CI / image

`.github/workflows/ci.yml` — lint + typecheck + Prettier + `next build` on every
push/PR; publishes `ghcr.io/ar-ecommerce-platform/web` on `main`/`develop`;
gitleaks. Same shape as the backend repos.

See `infra/RUNBOOK.md` for the full platform runbook.
