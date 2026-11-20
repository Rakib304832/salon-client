/**
 * Barrel export for reusable UI primitives.
 *
 * Importing from "@/components/ui" keeps page code short:
 *   import { Button, Input, StatusBadge } from "@/components/ui";
 *
 * This file contains no logic. It only gives the component library one stable
 * entry point as more pieces are added in later commits.
 */
export { Badge, BlockedBadge, PaymentBadge, ServiceStatusBadge, StatusBadge } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";
export { Button, buttonStyles } from "./Button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./Button";
export { ConfirmDialog } from "./ConfirmDialog";
export type { ConfirmDialogProps } from "./ConfirmDialog";
export { CopyButton } from "./CopyButton";
export type { CopyButtonProps } from "./CopyButton";
export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";
export { ErrorState } from "./ErrorState";
export type { ErrorStateProps } from "./ErrorState";
export { Input } from "./Input";
export type { InputProps } from "./Input";
export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";
export { Select } from "./Select";
export type { SelectOption, SelectProps } from "./Select";
export { Skeleton, SkeletonCard, SkeletonGrid, SkeletonTable } from "./Skeleton";
export { Spinner } from "./Spinner";
export type { SpinnerProps } from "./Spinner";
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";
