# SalonBook — Client

SalonBook is a role-based salon appointment booking platform. This repository
contains the **client-side** Next.js application: the public service catalogue,
authentication screens, customer dashboard, booking flow, payment return pages,
and the shared UI system used across the app.

This project is intentionally **client-only**. Authentication, MongoDB, Stripe
Checkout, Stripe webhooks, and ImgBB uploads all live in a separate Express REST
API. There is no Express server, database model, webhook handler, or secret in
this repository. Browser code talks to the API through `NEXT_PUBLIC_API_URL`.

## Links

- Live site: **pending deployment URL** — deploy this client and replace this
  line with the production URL before submission.
- Client repository: https://github.com/Rakib304832/salon-client.git
- Server repository: https://github.com/Rakib304832/Salon-server-site.git

## Important features

- Public home page with brand story, API-derived category tiles, and six
  featured active services.
- Service browsing with debounced search, category filtering, price sorting,
  URL-synced filter state, and skeleton/empty/error/retry states.
- Protected service detail pages: guests are redirected to sign-in with a
  return URL, blocked accounts see the blocked screen, and details show price,
  duration, category, image fallback, and an auth-aware request form.
- Better Auth sign-in and sign-up screens through the Express server, including
  Google sign-in, session persistence, logout, and guarded routes.
- Public header profile dropdown with the signed-in user's name, Dashboard,
  profile link, and Logout.
- Blocked-account and access-denied screens that reflect live server state.
- Customer dashboard with server-calculated total, pending, confirmed,
  cancelled, and paid appointment statistics plus recent requests.
- Customer appointment history with status and payment filters, service image
  and category, details dialog, pending cancellation, and Stripe **Pay Now** for
  confirmed appointments.
- Profile editing for name, phone, and image, with authenticated ImgBB uploads
  through the Express API.
- Payment success polling against the webhook-backed session endpoint and a
  cancel page that safely offers another checkout attempt.
- Admin dashboard guarded by role, with server statistics, revenue overview,
  popular-service reporting, and explicit total/confirmed appointment counts.
- Admin service management with create/edit forms, upload-only service images,
  Active/Inactive status control, activate/deactivate controls, and delete
  protection tied to live bookings.
- Admin appointment management with server-side filters, details dialog, and
  confirm/cancel actions that follow the server state machine.
- Admin user management with search and filters, plus customer-only
  block/unblock actions. Roles remain server-assigned.
- Read-only Stripe transaction history with explicit currency labels,
  cent-to-major-unit conversion, and no client-side refund or payment mutation.
- Admin profile editing that reuses the customer form while keeping email, role,
  and blocked state server-owned.
- Branded 404 and root error pages for invalid routes and unhandled UI errors.
- Footer with salon email, telephone, address, opening hours, and social links.
- Shared button, input, select, textarea, badge, modal, confirmation dialog,
  skeleton, spinner, toast, empty-state, and error-state components.
- Fully responsive salon-themed layout: desktop tables/sidebar and mobile
  stacked cards with scrollable navigation.
- Keyboard accessibility features: skip link, focus-visible rings, labelled
  tables, a focus-trapping modal, focus return on close, Escape-to-close
  overlays, and a keyboard-operable profile menu.

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
npm run start
```

`npm run start` serves the production build from `npm run build` on port 3000.

## Deployment

This repository is a client-only Next.js application and can be deployed to any
host that supports Next.js 16, including Vercel.

1. Import the **client** repository and keep the Express server deployed
   separately from the server repository above.
2. Set `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_URL`, and
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the host's environment settings. Values are
   intentionally not stored in this repository.
3. Set them **before** building: `NEXT_PUBLIC_*` values are inlined into the
   browser bundle at build time. A later environment change requires a rebuild.
4. Use `npm install`, `npm run build`, and `npm run start` unless the host
   provides equivalent managed commands.
5. Configure the Express API to allow the deployed client origin with
   credentials, and configure Better Auth/trusted redirects on the server to use
   the same client origin.
6. Configure the server's Stripe success/cancel URLs to point at the deployed
   `/booking/success` and `/booking/cancel` routes (or the `/payment/*` aliases).
7. After deployment, run the smoke tests in
   [docs/VERIFICATION.md](docs/VERIFICATION.md) and replace the pending live URL
   in the Links section above.

The client never contains database URLs, Stripe secret keys, ImgBB keys, or
Better Auth secrets. Those belong only in the server deployment.

## Required environment variables

### Client / deployment-facing names used in this repository

- `NEXT_PUBLIC_API_URL`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Server-only names — documented here by name only, never used by the client

- `MONGODB_URI`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `IMGBB_API_KEY`
- `CLIENT_URL`
- `PORT`

Never commit `.env`, `.env.local`, API keys, or credentials. Only the variable
**names** are documented here; all values stay in each deployment's environment
settings.

## Verification

Automated checks are `npm run typecheck`, `npm run lint`, and `npm run build`.
A successful build includes all public, auth, customer, admin, booking and
payment routes. For local or deployed manual smoke tests, follow
[docs/VERIFICATION.md](docs/VERIFICATION.md).

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
- Sign-up accepts name, email, password, and an optional image URL. Phone is
  updated later in the profile because `/api/uploads` requires a session.
