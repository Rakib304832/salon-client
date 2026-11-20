import { api } from "./client";
import type { Transaction, TransactionStatus } from "@/types";

export interface TransactionQuery {
  status?: TransactionStatus;
  customerId?: string;
  appointmentId?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Transactions are read-only in the client. There is intentionally no create,
 * update, or delete method here; only the verified Stripe webhook writes them.
 */
export const transactionsApi = {
  adminList(params: TransactionQuery = {}) {
    return api.get<Transaction[]>("/api/admin/transactions", { params });
  },
};
