import type { Metadata } from "next";
import { ServiceManager } from "@/components/admin";

export const metadata: Metadata = {
  title: "Manage services | SalonBook admin",
  description: "Create, edit, activate and delete services in the salon catalogue.",
};

/**
 * URL-to-screen mapping only. The service API calls, upload flow, filters and
 * mutation feedback all live in the reusable ServiceManager client component.
 */
export default function AdminServicesPage() {
  return <ServiceManager />;
}
