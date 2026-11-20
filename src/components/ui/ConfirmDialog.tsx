"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Danger is used for cancel appointment, delete service, and block user. */
  variant?: "danger" | "primary";
  loading?: boolean;
}

/**
 * One shared confirmation dialog for every destructive action in the brief:
 * - Customer cancels a Pending appointment.
 * - Admin deletes a service.
 * - Admin blocks/unblocks a user.
 *
 * The parent owns `loading` so the confirm button can show a spinner while the
 * API request runs. We never close the dialog before the request finishes.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={() => void onConfirm()}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-muted">
        This action will be sent to the server immediately. Please make sure you
        want to continue.
      </p>
    </Modal>
  );
}
