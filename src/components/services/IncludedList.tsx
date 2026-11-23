import { Check } from "lucide-react";
import type { Service } from "@/types";

/**
 * "What's included" checklist shown under the service image on the detail
 * screen. The items are derived from the service category/name so the list is
 * relevant without adding a new field to the API contract.
 */
export interface IncludedListProps {
  service: Service;
}

function itemsFor(service: Service): string[] {
  const text = `${service.serviceName} ${service.category}`.toLowerCase();

  if (text.includes("massage") || text.includes("spa")) {
    return [
      "Consultation and pressure preferences",
      "Warm oil or premium spa products",
      "Full treatment at your chosen duration",
      "Time to relax before you leave",
    ];
  }

  if (text.includes("facial") || text.includes("skin")) {
    return [
      "Skin consultation",
      "Cleanse and gentle exfoliation",
      "Treatment mask and massage",
      "Moisturiser and aftercare advice",
    ];
  }

  if (text.includes("nail") || text.includes("manicure") || text.includes("pedicure")) {
    return [
      "Nail shaping and cuticle care",
      "Polish or gel finish",
      "Hand or foot massage",
      "Finishing touches",
    ];
  }

  if (text.includes("makeup")) {
    return [
      "Skin preparation",
      "Full makeup application",
      "Lashes and finishing touches",
      "Touch-up kit and aftercare advice",
    ];
  }

  return [
    "Consultation and service plan",
    "Professional wash and preparation",
    "The booked service in full",
    "Finishing and aftercare advice",
  ];
}

export function IncludedList({ service }: IncludedListProps) {
  return (
    <section className="mt-6 rounded-card border border-line bg-white p-6 shadow-sm">
      <h2 className="text-xl">What&apos;s included</h2>
      <ul className="mt-4 space-y-3">
        {itemsFor(service).map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-muted">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush-light text-plum">
              <Check aria-hidden="true" className="h-3 w-3" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
