"use client";

import {
  useCallback,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  CalendarClock,
  ImageOff,
  Pencil,
  Plus,
  RotateCw,
  Scissors,
  Trash2,
} from "lucide-react";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Select,
  ServiceStatusBadge,
  Skeleton,
  buttonStyles,
} from "@/components/ui";
import { canRenderWithNextImage } from "@/components/services/service-image";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { useAdminResource } from "@/hooks/useAdminResource";
import { servicesApi } from "@/lib/api";
import { API_CATEGORIES, SORT_OPTIONS, type ServiceSort } from "@/lib/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils";
import type { Service, ServiceStatus } from "@/types";

/**
 * ADMIN SERVICE MANAGER
 * ---------------------
 * This screen is the authenticated counterpart to the public /services catalogue.
 *
 * Important contract differences:
 * - GET /api/admin/services returns ACTIVE and INACTIVE services.
 * - GET /api/services returns active services only.
 * - Creating or editing content uses POST/PUT /api/services with an image URL.
 * - Availability is changed through PATCH /api/services/:id/status, never by
 *   sending `status` in the content form.
 * - Deleting is rejected by Express while pending/confirmed appointments still
 *   reference the service; the server's 409 message is shown through a toast.
 *
 * Search, category and sort are sent to the server because it already supports
 * them. Status is a local view filter because the list endpoint has no status
 * query parameter.
 */
type StatusFilter = "all" | ServiceStatus;

interface ServiceFilters {
  search: string;
  category: string;
  sort: ServiceSort;
  // Allows the object to be passed straight to servicesApi.adminList.
  [key: string]: string | number | boolean | null | undefined;
}

interface BusyAction {
  id: string;
  kind: "status" | "delete";
}

const EMPTY_FILTERS: ServiceFilters = {
  search: "",
  category: "",
  sort: "",
};

export function ServiceManager() {
  const [draft, setDraft] = useState<ServiceFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<ServiceFilters>(EMPTY_FILTERS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  // Incrementing this key guarantees a fresh react-hook-form state each time the
  // modal opens, even when the admin edits the same service twice in a row.
  const [formInstance, setFormInstance] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [busy, setBusy] = useState<BusyAction | null>(null);

  const load = useCallback(
    () => servicesApi.adminList(filters),
    [filters],
  );
  const filterKey = JSON.stringify(filters);

  const {
    items,
    error,
    loading,
    reload,
    replaceItem,
    removeItem,
  } = useAdminResource<Service>(load, filterKey, "We could not load services.");

  const counts = useMemo(() => {
    const list = items ?? [];
    return {
      all: list.length,
      active: list.filter((service) => service.status === "active").length,
      inactive: list.filter((service) => service.status === "inactive").length,
    };
  }, [items]);

  const visible = useMemo(() => {
    if (!items) return [];
    if (statusFilter === "all") return items;
    return items.filter((service) => service.status === statusFilter);
  }, [items, statusFilter]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({
      search: draft.search.trim(),
      category: draft.category,
      sort: draft.sort,
    });
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setStatusFilter("all");
  }

  function openCreate() {
    setEditingService(null);
    setFormInstance((value) => value + 1);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setFormInstance((value) => value + 1);
    setFormOpen(true);
  }

  function handleSaved(saved: Service) {
    if (editingService) {
      replaceItem(saved);
    } else if (items) {
      // A newly created service is active by default, so an "Inactive" view
      // would hide it. Reloading after resetting that local tab guarantees the
      // new row appears in the server's newest-first order.
      setStatusFilter("all");
      reload();
    }

    setFormOpen(false);
    setEditingService(null);
  }

  async function handleToggleStatus(service: Service) {
    const nextStatus: ServiceStatus =
      service.status === "active" ? "inactive" : "active";
    setBusy({ id: service._id, kind: "status" });

    try {
      const updated = await servicesApi.setStatus(service._id, nextStatus);
      replaceItem(updated);
      toastSuccess(
        nextStatus === "active" ? "Service activated" : "Service deactivated",
        `${updated.serviceName} is now ${nextStatus}.`,
      );
    } catch (caught) {
      toastApiError(caught, "Could not change this service's status.");
    } finally {
      setBusy(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setBusy({ id: target._id, kind: "delete" });

    try {
      await servicesApi.remove(target._id);
      removeItem(target._id);
      setDeleteTarget(null);
      toastSuccess("Service deleted", `${target.serviceName} was removed.`);
    } catch (caught) {
      toastApiError(caught, "Could not delete this service.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full rounded-card" />
        <Skeleton className="h-10 w-full rounded-card" />
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-20 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load the service catalogue"
        message={error}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Manage services</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Add treatments, update details, and control which services customers
            can book. Active appointments protect a service from deletion.
          </p>
        </div>
        <Button variant="accent" leftIcon={<Plus aria-hidden="true" className="h-4 w-4" />} onClick={openCreate}>
          New service
        </Button>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-sm">
        <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <Input
            label="Search"
            placeholder="Name or description"
            value={draft.search}
            onChange={(event) => setDraft({ ...draft, search: event.target.value })}
          />

          <Select
            label="Category"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            options={API_CATEGORIES.map((category) => ({
              value: category,
              label: category,
            }))}
            placeholder="All categories"
          />

          <Select
            label="Sort by price"
            value={draft.sort}
            onChange={(event) =>
              setDraft({ ...draft, sort: event.target.value as ServiceSort })
            }
            options={SORT_OPTIONS.filter((option) => option.value !== "").map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            placeholder="Default order"
          />

          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              Apply
            </Button>
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Clear
            </Button>
          </div>
        </form>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Filter by status">
          {([
            { value: "all", label: `All (${counts.all})` },
            { value: "active", label: `Active (${counts.active})` },
            { value: "inactive", label: `Inactive (${counts.inactive})` },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              aria-pressed={statusFilter === tab.value}
              className={buttonStyles({
                variant: statusFilter === tab.value ? "primary" : "outline",
                size: "sm",
              })}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCw aria-hidden="true" className="h-3.5 w-3.5" />}
          onClick={reload}
        >
          Refresh
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No services match these filters"
          description="Try a different search or clear the filters to see the full catalogue."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          }
          icon={<Scissors aria-hidden="true" className="h-6 w-6" />}
        />
      ) : (
        <>
          {/* Desktop keeps the dense table; mobile gets full-width cards below
              so admins never have to scroll a six-column grid sideways. */}
          <div className="hidden overflow-hidden rounded-card border border-line bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <caption className="sr-only">
                  Salon services with category, price, duration, availability and actions.
                </caption>
                <thead className="bg-blush-light text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-bold">Service</th>
                    <th scope="col" className="px-5 py-3 font-bold">Category</th>
                    <th scope="col" className="px-5 py-3 font-bold">Price</th>
                    <th scope="col" className="px-5 py-3 font-bold">Duration</th>
                    <th scope="col" className="px-5 py-3 font-bold">Status</th>
                    <th scope="col" className="px-5 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((service) => (
                    <ServiceRow
                      key={service._id}
                      service={service}
                      busy={busy?.id === service._id ? busy.kind : null}
                      onEdit={() => openEdit(service)}
                      onToggleStatus={() => void handleToggleStatus(service)}
                      onDelete={() => setDeleteTarget(service)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {visible.map((service) => (
              <ServiceMobileCard
                key={service._id}
                service={service}
                busy={busy?.id === service._id ? busy.kind : null}
                disabled={busy !== null}
                onEdit={() => openEdit(service)}
                onToggleStatus={() => void handleToggleStatus(service)}
                onDelete={() => setDeleteTarget(service)}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingService ? "Edit service" : "Create service"}
        description={
          editingService
            ? "Update the catalogue details, image and Active/Inactive status."
            : "Upload an image and choose Active or Inactive. Active services appear in public browsing."
        }
        size="lg"
      >
        <ServiceForm
          key={formInstance}
          service={editingService}
          onSuccess={handleSaved}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete this service?"
        description={
          deleteTarget
            ? `${deleteTarget.serviceName} will be removed from the catalogue. Services with pending or confirmed appointments cannot be deleted.`
            : ""
        }
        confirmLabel="Delete service"
        loading={busy?.kind === "delete"}
      />
    </div>
  );
}

interface ServiceRowProps {
  service: Service;
  busy: BusyAction["kind"] | null;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

/** One table row is isolated so action buttons never bloat the parent render. */
function ServiceRow({
  service,
  busy,
  onEdit,
  onToggleStatus,
  onDelete,
}: ServiceRowProps) {
  const imageIsSafe = canRenderWithNextImage(service.image);

  return (
    <tr>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blush-light">
            {imageIsSafe ? (
              <Image
                src={service.image}
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff aria-hidden="true" className="h-5 w-5 text-muted" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[220px] truncate font-bold text-plum">
              {service.serviceName}
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Added {formatDate(service.createdAt)}
            </span>
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-muted">{service.category}</td>
      <td className="px-5 py-4 font-bold text-plum">
        {formatCurrency(service.price)}
      </td>
      <td className="px-5 py-4 text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 text-rose-gold" />
          {formatDuration(service.duration)}
        </span>
      </td>
      <td className="px-5 py-4">
        <ServiceStatusBadge status={service.status} />
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={onEdit} disabled={busy !== null}>
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStatus}
            loading={busy === "status"}
            disabled={busy !== null}
          >
            {service.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            loading={busy === "delete"}
            disabled={busy !== null}
            aria-label={`Delete ${service.serviceName}`}
            className="text-status-blocked-text hover:bg-status-blocked-bg"
          >
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/**
 * Mobile equivalent of ServiceRow.
 *
 * The same handlers and busy state are passed in, so an action behaves
 * identically whichever layout the viewport selected. Only the information
 * arrangement changes: cards stack instead of forcing horizontal table scroll.
 */
interface ServiceMobileCardProps extends ServiceRowProps {
  disabled: boolean;
}

function ServiceMobileCard({
  service,
  busy,
  disabled,
  onEdit,
  onToggleStatus,
  onDelete,
}: ServiceMobileCardProps) {
  const imageIsSafe = canRenderWithNextImage(service.image);

  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blush-light">
          {imageIsSafe ? (
            <Image
              src={service.image}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageOff aria-hidden="true" className="h-6 w-6 text-muted" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-plum">{service.serviceName}</p>
          <p className="mt-0.5 text-xs text-muted">{service.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ServiceStatusBadge status={service.status} />
            <span className="text-sm font-bold text-plum">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-ivory p-3 text-xs">
        <div>
          <dt className="text-muted">Duration</dt>
          <dd className="mt-0.5 font-bold text-plum">
            {formatDuration(service.duration)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Added</dt>
          <dd className="mt-0.5 font-bold text-plum">
            {formatDate(service.createdAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled}>
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleStatus}
          loading={busy === "status"}
          disabled={disabled}
        >
          {service.status === "active" ? "Deactivate" : "Activate"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          loading={busy === "delete"}
          disabled={disabled}
          className="text-status-blocked-text hover:bg-status-blocked-bg"
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </article>
  );
}
