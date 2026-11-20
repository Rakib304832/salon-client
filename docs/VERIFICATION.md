# SalonBook client verification guide

This checklist is for the **client** repository only. It assumes the separate
Express API is running and that `NEXT_PUBLIC_API_URL` points to its origin
(scheme, host, and optional port, without `/api`).

Use a development/test database and Stripe test mode. Do not put real secrets or
production customer data in the client repository.

## 1. Automated checks

Run these from the repository root:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Expected result:

- `typecheck` exits with no TypeScript errors.
- `lint` exits with no errors or warnings.
- `build` compiles and reports **22 routes**, including:
  - `/`
  - `/services`
  - `/services/[id]`
  - `/sign-in`
  - `/sign-up`
  - `/dashboard/customer` and its two child pages
  - `/dashboard/admin` and its five child pages
  - `/booking/success`, `/booking/cancel`
  - `/payment/success`, `/payment/cancel`
  - `/access-denied`, `/account-blocked`

Optional production smoke test:

```bash
npm run start
```

## 2. Environment and security checks

- [ ] `.env.local` exists locally but is not committed.
- [ ] Only `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_URL`, and
      `NEXT_PUBLIC_GOOGLE_CLIENT_ID` are used as environment names in client
      code.
- [ ] No API origin is hardcoded in TypeScript or JSX.
- [ ] No Stripe secret, database URL, ImgBB key, or Better Auth secret appears in
      the browser bundle or this repository.
- [ ] The Express API allows the client origin with credentials enabled, so
      `credentials: "include"` requests can send the session cookie.
- [ ] A 401 from the API redirects to `/sign-in` with a safe return URL.
- [ ] A 403 shows the access-denied or blocked-account screen instead of a
      generic crash.

## 3. Public pages

- [ ] Home page renders the hero, category tiles, and featured services from
      the API.
- [ ] Home and service pages show skeletons while loading.
- [ ] Service search is debounced and updates the URL query string.
- [ ] Category and price filters can be combined and cleared.
- [ ] An empty result shows the empty state with a working clear action.
- [ ] A failed API response shows the error state with a retry button.
- [ ] Service cards use a local fallback when the image URL is unavailable.
- [ ] Service detail shows price, duration, category, and description.
- [ ] The appointment form on detail is auth-aware: guests are prompted to sign
      in before submitting.

## 4. Authentication and role guards

Use one customer account, one admin account, and (if available) one blocked
account.

- [ ] Sign-up accepts name, email, password, phone, and an image URL.
- [ ] Sign-in persists the Better Auth session after refresh.
- [ ] Google sign-in redirects correctly when configured on the server.
- [ ] Sign-out returns to a public page and clears protected-route access.
- [ ] A customer opening `/dashboard/admin` sees the access-denied screen.
- [ ] An admin opening a customer-only route sees the access-denied screen.
- [ ] A blocked account can browse public pages but cannot book or enter a
      dashboard.
- [ ] The header shows the correct dashboard link for the active role.

## 5. Customer dashboard

- [ ] Dashboard statistics come from `GET /api/appointments/stats`.
- [ ] Recent appointments show service, date, time, status, and payment state.
- [ ] Appointment history filters by status and payment state.
- [ ] The details dialog shows the customer note when one exists.
- [ ] Only a pending, unpaid appointment offers **Cancel**.
- [ ] Only a confirmed, unpaid appointment offers **Pay now**.
- [ ] Cancelling a pending appointment updates the row without a full reload.
- [ ] Profile update changes name, phone, and image only.
- [ ] Profile image upload uses the authenticated `/api/uploads` route.
- [ ] Email, role, and blocked state are not editable in the browser.

## 6. Booking and payment returns

- [ ] A request uses an allowed date after today in UTC.
- [ ] Only the ten fixed hourly slots from 09:00 AM to 06:00 PM are offered.
- [ ] Admin confirmation unlocks the customer's **Pay now** action.
- [ ] Checkout redirects to Stripe-hosted Checkout, never to a client-rendered
      payment form.
- [ ] `/booking/success?session_id=...` polls
      `GET /api/payments/session/:sessionId` and shows verified data only.
- [ ] `/payment/success?session_id=...` behaves identically to the booking path.
- [ ] `/booking/cancel` and `/payment/cancel` both offer a safe retry path.
- [ ] The client never patches payment status itself; the webhook owns it.

## 7. Admin dashboard and management

- [ ] Admin overview loads `GET /api/admin/stats` and shows counts, revenue,
      and popular services.
- [ ] Services screen lists both active and inactive services.
- [ ] Creating a service sends content fields only; `status` is not part of the
      create/update payload.
- [ ] Editing a service preserves its current status.
- [ ] Uploading a service image uses the authenticated upload route.
- [ ] Activate/deactivate uses `PATCH /api/services/:id/status`.
- [ ] Deleting a service with pending or confirmed appointments is refused by
      the server and the 409 message is shown in a toast.
- [ ] Appointments can be filtered by status, payment state, and date.
- [ ] A pending appointment can be confirmed once.
- [ ] A pending or confirmed appointment can be cancelled.
- [ ] A cancelled appointment is final and offers no confirm/cancel action.
- [ ] Payment badges are read-only in the admin appointment screen.
- [ ] Users can be searched and filtered by role and blocked state.
- [ ] Only customer rows offer block/unblock; admin rows are protected.
- [ ] The signed-in admin cannot block themselves.
- [ ] No UI control can change a user's role.
- [ ] Transactions are read-only and show paid/failed state only.
- [ ] Transaction amounts are divided by 100 before display.
- [ ] Session IDs are shortened visually but fully copied by the copy button.
- [ ] Admin profile updates name, phone, and image only.

## 8. Responsive and accessibility checks

Check at 375 px, 768 px, and 1280 px widths.

- [ ] Public navigation collapses to a working mobile menu.
- [ ] Admin tables become stacked cards below `md` without horizontal scroll.
- [ ] Filter forms stack cleanly on small screens.
- [ ] Modals remain usable and do not overflow the viewport.
- [ ] Pressing Tab once from page load reveals **Skip to main content**.
- [ ] Activating the skip link moves focus to `#main-content`.
- [ ] Every interactive control has a visible focus ring or outline.
- [ ] Opening a modal moves focus to its close button.
- [ ] Tab and Shift+Tab stay inside an open modal.
- [ ] Escape closes an open modal or mobile menu.
- [ ] Closing a modal returns focus to the control that opened it.
- [ ] Admin tables have screen-reader-only captions.
- [ ] Decorative icons are hidden with `aria-hidden="true"`.

## 9. Sign-off

Record the date, commit SHA, environment, and tester:

- Commit SHA: ______________________
- Client URL: ______________________
- API origin: ______________________
- Tested by: _______________________
- Date: ____________________________
- Result: Pass / Fail (delete one)
