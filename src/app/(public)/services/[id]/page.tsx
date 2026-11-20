import type { Metadata } from "next";
import { ServiceDetail } from "@/components/services";

/**
 * SERVICE DETAIL ROUTE
 * --------------------
 * Dynamic segment folder: `[id]` becomes `/services/:id` without adding another
 * path level, so cards can link directly to `/services/65abc...`.
 *
 * Next.js 16 note: `params` is a Promise. Awaiting it in this Server Component
 * gives the client detail component a plain string id. We do not fetch the
 * service on the server because this repository is intentionally client-only:
 * the browser calls the Express API through NEXT_PUBLIC_API_URL.
 */
export const metadata: Metadata = {
  title: "Service details",
  description:
    "View salon service details, pricing, duration and available booking slots.",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ServiceDetail serviceId={id} />;
}
