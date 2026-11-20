import { api } from "./client";
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  CustomerStats,
} from "@/types";

export interface AdminAppointmentQuery {
  status?: AppointmentStatus;
  paymentStatus?: string;
  appointmentDate?: string;
  serviceId?: string;
  customerId?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Appointment endpoints.
 *
 * Customer calls never accept a customerId — the server reads it from the
 * session. That is how "customers only see their own appointments" is enforced.
 */
export const appointmentsApi = {
  create(input: AppointmentInput) {
    return api.post<Appointment>("/api/appointments", { body: input });
  },

  mine() {
    return api.get<Appointment[]>("/api/appointments/mine");
  },

  stats() {
    return api.get<CustomerStats>("/api/appointments/stats");
  },

  getById(id: string) {
    return api.get<Appointment>(`/api/appointments/${encodeURIComponent(id)}`);
  },

  cancel(id: string) {
    return api.patch<Appointment>(
      `/api/appointments/${encodeURIComponent(id)}/cancel`,
    );
  },

  adminList(params: AdminAppointmentQuery = {}) {
    return api.get<Appointment[]>("/api/admin/appointments", { params });
  },

  adminGetById(id: string) {
    return api.get<Appointment>(
      `/api/admin/appointments/${encodeURIComponent(id)}`,
    );
  },

  /**
   * One endpoint for both admin actions; the body decides the transition.
   * - pending -> confirmed
   * - pending or confirmed -> cancelled
   */
  adminSetStatus(id: string, status: AppointmentStatus) {
    return api.patch<Appointment>(
      `/api/admin/appointments/${encodeURIComponent(id)}/status`,
      { body: { status } },
    );
  },
};
