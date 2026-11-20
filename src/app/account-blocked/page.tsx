import type { Metadata } from "next";
import { AccountBlocked } from "@/components/auth";

/**
 * Standalone Account Blocked route.
 *
 * A blocked user can still browse public pages. This page explains why booking
 * and dashboard actions are unavailable and lets them switch accounts.
 */
export const metadata: Metadata = {
  title: "Account blocked",
};

export default function AccountBlockedPage() {
  return <AccountBlocked />;
}
