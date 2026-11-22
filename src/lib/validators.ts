import { z } from "zod";
import { API_CATEGORIES, TIME_SLOTS } from "./constants";

/**
 * Zod schemas shared by all forms.
 *
 * Client validation is for fast feedback only — the server validates again and
 * is always the source of truth. Keeping schemas here means Sign Up, Booking,
 * Profile and Service forms cannot drift apart.
 */

const emailSchema = z.string().min(1, "Email is required.").email("Enter a valid email address.");

/**
 * Password rules from the brief, shown as hints in the sign-up form:
 * - minimum 6 characters
 * - at least one uppercase letter
 * - at least one lowercase letter
 */
export const passwordSchema = z
  .string()
  .min(6, "Use at least 6 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.");

const optionalImageSchema = z
  .union([z.string().url("Enter a valid image URL."), z.literal("")])
  .optional();

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: emailSchema,
  password: passwordSchema,
  // Sign-up accepts an image URL. File uploads are attempted separately before
  // registration and fall back to this URL field if the server requires auth.
  image: optionalImageSchema,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * "YYYY-MM-DD" for the first date the server accepts (tomorrow in UTC).
 *
 * Date inputs need an explicit `min` attribute. Computing it from UTC matches
 * the server's booking rule, so a user in any time zone sees the same earliest
 * selectable day the API will accept.
 */
export function earliestBookingDate(): string {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );

  return tomorrow.toISOString().slice(0, 10);
}

/**
 * Converts "YYYY-MM-DD" to a UTC day number and rejects today or earlier.
 *
 * The first check mirrors the server's parseAppointmentDate(): JavaScript's
 * Date.UTC() silently rolls invalid dates such as 2026-02-30 into March.
 * Comparing the rebuilt UTC components rejects those impossible dates before
 * they ever reach the API.
 */
function isFutureUtcDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const selected = new Date(Date.UTC(year, month - 1, day));

  const isRealCalendarDate =
    selected.getUTCFullYear() === year &&
    selected.getUTCMonth() === month - 1 &&
    selected.getUTCDate() === day;
  if (!isRealCalendarDate) return false;

  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return selected.getTime() > todayUtc;
}

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service is required."),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
    .refine(isFutureUtcDate, "Choose a date after today."),
  timeSlot: z.enum(
    TIME_SLOTS,
    "Choose a time slot from 09:00 AM to 06:00 PM.",
  ),
  message: z.string().max(500, "Keep your message under 500 characters.").optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  phone: z
    .string()
    .max(20, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  image: optionalImageSchema,
});
export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Admin service form limits mirror the server's Zod route schema exactly.
 *
 * `status` is part of the form so the admin can choose Active/Inactive, but it
 * is stripped from the create/update content payload by ServiceForm and applied
 * through the dedicated PATCH /:id/status route. The server ignores status in a
 * normal content PUT, so sending it there would silently mislead the admin.
 */
export const serviceFormSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(100, "Keep the service name under 100 characters."),
  category: z.enum(API_CATEGORIES, "Choose a service category."),
  description: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters about this service.")
    .max(2000, "Keep the description under 2000 characters."),
  price: z.coerce
    .number()
    .positive("Price must be greater than 0.")
    .max(100000, "Price cannot exceed 100000."),
  duration: z.coerce
    .number()
    .int("Duration must be a whole number of minutes.")
    .positive("Duration must be greater than 0.")
    .max(600, "Duration cannot exceed 600 minutes."),
  // Empty is allowed at validation time so a newly chosen file can be uploaded
  // inside onSubmit. ServiceForm then requires either an existing URL (edit
  // mode) or a selected file. The browser never sends an ImgBB key here.
  image: z.union([z.literal(""), z.string().url("Upload a valid service image.")]),
  status: z.enum(["active", "inactive"], "Choose a service status."),
});
/** Raw field values are strings from number inputs; parsed values are numbers. */
export type ServiceFormValues = z.input<typeof serviceFormSchema>;
export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

/** Helper for inline field errors from react-hook-form + server 400 responses. */
export function firstFieldError(
  errors: Array<{ field?: string; message: string }> | undefined,
  field: string,
): string | undefined {
  return errors?.find((error) => error.field === field)?.message;
}
