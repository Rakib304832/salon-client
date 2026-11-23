/**
 * Shared constants for the SalonBook client.
 *
 * Figma vs server note:
 * - The Figma design presents seven curated customer-facing categories such as
 *   "Haircut & Styling" and "Facial & Skincare".
 * - The Express catalogue uses short category values such as "Hair" and
 *   "Facial". Those short values are the server contract and must stay in
 *   API_CATEGORIES for forms, validation and filtering.
 * - HOME_CATEGORY_GROUPS bridges the two: each group has a display label, the
 *   API category it queries, and keywords used to group live service names.
 */

/** Customer-facing category tiles and browse pills from the Figma design. */
export const HOME_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const;

/** Exact category values accepted by the Express API. */
export const API_CATEGORIES = [
  "Hair",
  "Facial",
  "Massage",
  "Nails",
  "Makeup",
  "Waxing",
  "Bridal",
] as const;

export type HomeCategory = (typeof HOME_CATEGORIES)[number];
export type Category = (typeof API_CATEGORIES)[number];

export interface CategoryGroup {
  label: HomeCategory;
  apiCategories: readonly string[];
  keywords: readonly string[];
}

/**
 * Ordered exactly as the seven numbered tiles in the Figma design. More
 * specific hair groups come before the generic styling group so a Keratin
 * service is not claimed by "Haircut & Styling" merely because its API
 * category is "Hair".
 */
export const HOME_CATEGORY_GROUPS: readonly CategoryGroup[] = [
  {
    label: "Haircut & Styling",
    apiCategories: ["Hair"],
    keywords: ["haircut", "styling", "trim", "blow"],
  },
  {
    label: "Hair Coloring",
    apiCategories: ["Hair"],
    keywords: ["color", "colour", "balayage", "highlight"],
  },
  {
    label: "Hair Treatment",
    apiCategories: ["Hair"],
    keywords: ["keratin", "treatment", "smooth", "repair"],
  },
  {
    label: "Facial & Skincare",
    apiCategories: ["Facial"],
    keywords: ["facial", "skin"],
  },
  {
    label: "Makeup",
    apiCategories: ["Makeup"],
    keywords: ["makeup"],
  },
  {
    label: "Manicure & Pedicure",
    apiCategories: ["Nails"],
    keywords: ["manicure", "pedicure", "nail"],
  },
  {
    label: "Spa & Massage",
    apiCategories: ["Massage"],
    keywords: ["massage", "spa"],
  },
];

export interface CategoryPillOption {
  label: string;
  value: string;
}

export const CATEGORY_PILL_OPTIONS: readonly CategoryPillOption[] = [
  { label: "All", value: "" },
  ...HOME_CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    value: group.label,
  })),
];

type CategorySource = { category?: string | null; serviceName?: string | null };

function normalise(value: string): string {
  return value.toLowerCase().trim();
}

/** Returns the design-category group a live service belongs to, if any. */
export function categoryGroupForService(
  service: CategorySource,
): CategoryGroup | null {
  const name = normalise(service.serviceName ?? "");
  const category = normalise(service.category ?? "");

  const keywordMatch = HOME_CATEGORY_GROUPS.find((group) =>
    group.keywords.some((keyword) => name.includes(keyword)),
  );
  if (keywordMatch) return keywordMatch;

  return (
    HOME_CATEGORY_GROUPS.find((group) =>
      group.apiCategories.some((value) => normalise(value) === category),
    ) ?? null
  );
}

/**
 * Resolves a URL category value to the pill label shown in the UI and the short
 * category value sent to the API. This keeps Figma-friendly links such as
 * `?category=Hair%20Coloring` working while still querying the real catalogue.
 */
export function resolveCategorySelection(value: string): {
  label: string;
  query: string;
} | null {
  if (!value) return null;

  const byLabel = HOME_CATEGORY_GROUPS.find((group) => group.label === value);
  if (byLabel) return { label: byLabel.label, query: byLabel.apiCategories[0] };

  const byQuery = HOME_CATEGORY_GROUPS.find((group) =>
    group.apiCategories.some((category) => category === value),
  );
  if (byQuery) return { label: byQuery.label, query: value };

  return { label: value, query: value };
}

/** True when a short API category is already represented by a design pill. */
export function isCoveredApiCategory(value: string): boolean {
  return HOME_CATEGORY_GROUPS.some((group) =>
    group.apiCategories.some((category) => category === value),
  );
}

/**
 * Orders the live catalogue so the Figma "signature services" appear first.
 * Services are matched by keywords because the seeded catalogue uses slightly
 * shorter names than the static design.
 */
const FEATURED_SERVICE_KEYWORDS = [
  ["haircut", "styling"],
  ["balayage", "color", "colour"],
  ["keratin", "smooth", "treatment"],
  ["facial", "glow"],
  ["makeup"],
  ["massage"],
] as const;

export function preferFeaturedServices<T extends CategorySource>(
  services: readonly T[],
): T[] {
  const selected: T[] = [];
  const used = new Set<T>();

  for (const keywords of FEATURED_SERVICE_KEYWORDS) {
    const match = services.find(
      (service) =>
        !used.has(service) &&
        keywords.some((keyword) =>
          normalise(service.serviceName ?? "").includes(keyword),
        ),
    );
    if (match) {
      selected.push(match);
      used.add(match);
    }
  }

  for (const service of services) {
    if (selected.length >= FEATURED_SERVICE_KEYWORDS.length) break;
    if (!used.has(service)) {
      selected.push(service);
      used.add(service);
    }
  }

  return selected;
}

/**
 * Fixed hourly slots required by the brief. The Figma design shows 90-minute
 * intervals, but the assignment brief wins, so we use 09:00 AM–06:00 PM hourly.
 */
export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/** Sort values must match the server contract exactly. */
export const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export type ServiceSort = "" | "price_asc" | "price_desc";

/**
 * URL query values are user-controlled. Only these three sort values are valid
 * in the server contract, so anything else is treated as "Recommended".
 */
export function isServiceSort(value: string): value is ServiceSort {
  return value === "" || value === "price_asc" || value === "price_desc";
}

/**
 * Central route map. Using these instead of raw strings prevents typos in
 * redirects, guards, and return URLs.
 */
export const ROUTES = {
  home: "/",
  services: "/services",
  paper: "/paper",
  signIn: "/sign-in",
  signUp: "/sign-up",
  customerDashboard: "/dashboard/customer",
  customerAppointments: "/dashboard/customer/appointments",
  customerProfile: "/dashboard/customer/profile",
  adminDashboard: "/dashboard/admin",
  adminServices: "/dashboard/admin/services",
  adminAppointments: "/dashboard/admin/appointments",
  adminUsers: "/dashboard/admin/users",
  adminTransactions: "/dashboard/admin/transactions",
  adminProfile: "/dashboard/admin/profile",
  paymentSuccess: "/payment/success",
  paymentCancel: "/payment/cancel",
  // Stripe's success/cancel URLs are built on the server and hardcode /booking.
  // We keep the /payment paths from the brief as readable aliases and register
  // both URL pairs in the App Router so either contract works in production.
  bookingSuccess: "/booking/success",
  bookingCancel: "/booking/cancel",
  accessDenied: "/access-denied",
  accountBlocked: "/account-blocked",
} as const;

/**
 * Public salon details used by the footer. Values mirror the Figma design.
 */
export const SALON_CONTACT = {
  email: "hello@salonbook.com",
  phoneDisplay: "+880 1700-000000",
  phoneHref: "+8801700000000",
  addressLines: ["Rajshahi, Bangladesh"],
  hours: [
    { days: "Sat - Thu", time: "10:00 AM - 9:00 PM" },
    { days: "Fri", time: "3:00 PM - 9:00 PM" },
    { days: "Public holidays", time: "Closed" },
  ],
  socialLinks: [
    { label: "f", href: "https://www.facebook.com/" },
    { label: "in", href: "https://www.linkedin.com/" },
    { label: "X", href: "https://x.com/" },
  ],
} as const;

export const APPOINTMENT_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
} as const;

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Unpaid",
  paid: "Paid",
} as const;

/** Error codes the client must branch on, copied from the server contract. */
export const API_ERROR_CODES = {
  ACCOUNT_BLOCKED: "ACCOUNT_BLOCKED",
  SLOT_ALREADY_BOOKED: "SLOT_ALREADY_BOOKED",
  APPOINTMENT_NOT_CANCELLABLE: "APPOINTMENT_NOT_CANCELLABLE",
  APPOINTMENT_ALREADY_PAID: "APPOINTMENT_ALREADY_PAID",
  APPOINTMENT_NOT_PAYABLE: "APPOINTMENT_NOT_PAYABLE",
  PAYMENT_NOT_CONFIRMED: "PAYMENT_NOT_CONFIRMED",
  UPLOAD_RATE_LIMITED: "UPLOAD_RATE_LIMITED",
  LAST_ADMIN_PROTECTED: "LAST_ADMIN_PROTECTED",
  STRIPE_CHECKOUT_FAILED: "STRIPE_CHECKOUT_FAILED",
} as const;
