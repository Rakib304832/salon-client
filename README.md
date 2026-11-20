<!--
  SALONBOOK CLIENT README — FOUNDATION SKELETON

  This README is intentionally a skeleton in Part 1. Later commits will fill in
  the complete feature list, installation steps, deployment links, and API
  assumptions. The HTML comments explain what belongs in each section so the
  final submission stays consistent with the assignment brief.
-->

# SalonBook — Client

<!--
  PROJECT NAME AND DESCRIPTION
  ----------------------------
  Keep the name exactly "SalonBook". Describe the client as the Next.js UI for
  a salon appointment booking platform: customers browse services and request
  appointments; admins manage services, appointments, users, and transactions.

  IMPORTANT ARCHITECTURE NOTE:
  This repository is CLIENT ONLY. Authentication, MongoDB, Stripe Checkout,
  Stripe webhooks, and ImgBB uploads all live in the separate Express server.
  There is no Express, MongoDB, or webhook code here.
-->

SalonBook is a role-based salon appointment booking platform. This repository
contains the client-side application: the public service browser, authentication
screens, customer dashboard, and admin dashboard. It talks to a separate REST
API using `NEXT_PUBLIC_API_URL`.

## Important features

<!--
  FEATURE LIST
  ------------
  Fill this in as features land. Expected final bullets:
  - Public home, service browsing, search/filter/sort, service details
  - Better Auth sign-in, sign-up, Google login, session persistence, logout
  - Customer booking, appointments, cancellation, Pay Now, profile
  - Admin service CRUD, appointments, users, transactions, profile, stats
  - Toasts, dialogs, badges, skeletons, empty/error states, 403/404/blocked UI
  - Fully responsive layout with desktop tables and mobile stacked cards
-->

_To be completed as features are implemented._

## Technology stack

<!--
  TECH STACK
  ----------
  List only tools actually used by this repository:
  - Next.js 16 (App Router) + React + TypeScript
  - Tailwind CSS v4 (CSS-first @theme tokens)
  - better-auth/react for client auth calls to the Express server
  - sonner for toasts
  - react-hook-form + zod for form validation
  - lucide-react for icons
-->

- Next.js (App Router) with TypeScript
- Tailwind CSS
- Better Auth client (`better-auth/react`)
- Sonner toasts
- React Hook Form + Zod

## Installation

<!--
  INSTALLATION
  ------------
  Use names only for environment variables. Never paste real URLs, keys, or
  credentials into this file, even as examples.
-->

```bash
npm install
cp .env.example .env.local
# Fill .env.local locally, then start the dev server below.
```

## Run locally

<!--
  LOCAL RUN
  ---------
  The client defaults to port 3000. The Express server must already be running
  and NEXT_PUBLIC_API_URL must point to its origin for API and auth calls.
-->

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required environment variables

<!--
  ENVIRONMENT VARIABLE NAMES ONLY
  -------------------------------
  This section must never contain values. .env.example is the tracked checklist;
  .env.local is ignored by Git.

  NEXT_PUBLIC_API_URL       -> browser-visible origin of the Express API
  BETTER_AUTH_URL           -> public Better Auth URL used by the server/deploy
  NEXT_PUBLIC_GOOGLE_CLIENT_ID -> optional public Google OAuth client ID

  Secret names such as STRIPE_SECRET_KEY, IMGBB_API_KEY, GOOGLE_CLIENT_SECRET,
  and BETTER_AUTH_SECRET must NEVER appear in client code or client env files.
-->

- `NEXT_PUBLIC_API_URL`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Live site

<!-- Add the deployed client URL after deployment. -->

_TBD after deployment._

## Repositories

<!--
  SUBMISSION LINKS
  ----------------
  Client repo is known. Server repo and live site should be filled in after the
  server is deployed. Admin email/password are submitted separately, never here.
-->

- Client: https://github.com/Rakib304832/salon-client.git
- Server: _TBD_
- Live site: _TBD_

## Assumptions about the server API

<!--
  API ASSUMPTIONS
  ---------------
  Final section will document contract details that differ from the design:
  - app responses use { success, data, message, errors, code }
  - auth uses Better Auth routes on the Express server
  - payment success polling uses GET /api/payments/session/:sessionId
  - server redirects to /booking/*; client provides aliases to /payment/*
  - sign-up image uses URL-first because /api/uploads requires a session
-->

_To be finalized after the API layer is implemented._
