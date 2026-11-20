# SalonBook — Client

SalonBook is a role-based salon appointment booking platform. This repository
contains the **client-side** Next.js application: the public service catalogue,
authentication screens, customer dashboard, booking flow, payment return pages,
and the shared UI system used across the app.

This project is intentionally **client-only**. Authentication, MongoDB, Stripe
Checkout, Stripe webhooks, and ImgBB uploads all live in a separate Express REST
API. There is no Express server, database model, webhook handler, or secret in
this repository. Browser code talks to the API through `NEXT_PUBLIC_API_URL`.

## Important features

- Public home page with brand story, category tiles, and featured services.
- Service browsing with debounced search, category filtering, price sorting,
  URL-synced filter state, and skeleton/empty/error/retry states.
- Service detail pages with pricing, duration, image fallback, and an
  auth-aware appointment request form.
- Better Auth sign-in and sign-up screens through the Express server, including
  Google sign-in, session persistence, logout, and guarded routes.
- Blocked-account and access-denied screens that reflect live server state.
- Customer dashboard with server-calculated appointment statistics and recent
  requests.
- Customer appointment history with status filters, details dialog, pending
  cancellation, and Stripe **Pay Now** for confirmed appointments.
- Profile editing for name, phone, and image, with authenticated ImgBB uploads
  through the Express API.
- Payment success polling against the webhook-backed session endpoint and a
  cancel page that safely offers another checkout attempt.
- Shared button, input, select, textarea, badge, modal, confirmation dialog,
  skeleton, spinner, toast, empty-state, and error-state components.
- Fully responsive salon-themed layout: desktop sidebar/navigation and mobile
  stacked cards and scrollable navigation.

## Technology stack

- Next.js 16 (App Router), React 19, and TypeScript
- Tailwind CSS v4 with CSS-first `@theme` design tokens
- `better-auth/react` for client authentication calls to the Express server
- Sonner for consistent action feedback
- React Hook Form and Zod for form validation
- Lucide React for icons
- A typed `fetch` layer with one error type and credential handling

## Installation

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` locally before starting the app. The tracked `.env.example`
contains variable **names only** and is safe to commit.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

The Express API must already be running, and `NEXT_PUBLIC_API_URL` must point to
its origin (scheme, host, and optional port — without a trailing `/api`). The
client appends routes such as `/api/services` and `/api/auth` itself.

Other useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Required environment variables

- `NEXT_PUBLIC_API_URL`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

Only these public or deployment-facing names appear in this repository. Secret
names and values belong exclusively to the server deployment. Never commit
`.env`, `.env.local`, API keys, or credentials.

## Live site

Pending deployment URL.

## Repositories

- Client: https://github.com/Rakib304832/salon-client.git
- Server: pending repository URL
- Live site: pending deployment URL

## Assumptions about the server API

- Application responses use the envelope
  `{ success, data, message, errors, code }`.
- Authentication is handled by Better Auth routes on the Express server. The
  client stores no tokens and sends cookies with `credentials: "include"`.
- The browser always derives the API origin from `NEXT_PUBLIC_API_URL`; no API
  origin is hardcoded in client code.
- Customer appointment statistics come from `GET /api/appointments/stats`;
  admin statistics come from `GET /api/admin/stats`.
- Appointment dates must be after today in UTC and use one of the ten fixed
  hourly slots from 09:00 AM to 06:00 PM. Slots are salon-wide.
- A customer may cancel only a pending, unpaid appointment and may pay only a
  confirmed, unpaid appointment. The server enforces both rules again.
- Checkout returns `{ url, sessionId }`; the browser redirects to Stripe's
  hosted URL. The client never changes payment status itself.
- Payment success is verified with `GET /api/payments/session/:sessionId`. The
  page retries while the verified webhook has not yet landed.
- Stripe redirects to `/booking/success` and `/booking/cancel`. The client also
  provides `/payment/success` and `/payment/cancel` aliases so both the server
  contract and the assignment route names work.
- Transaction amounts are returned in cents and divided by 100 for display.
  Service and appointment prices are already in major currency units.
- Sign-up accepts an image URL as the primary path because `/api/uploads`
  requires an authenticated session. Profile editing can upload a file after
  sign-in.
