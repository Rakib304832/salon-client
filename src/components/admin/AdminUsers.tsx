"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  RotateCw,
  Search,
  ShieldCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/providers";
import {
  Badge,
  BlockedBadge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Select,
  Skeleton,
} from "@/components/ui";
import { useAdminResource } from "@/hooks/useAdminResource";
import { usersApi } from "@/lib/api";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { formatDate } from "@/lib/utils";
import type { User, UserRole } from "@/types";

/**
 * ADMIN USER MANAGEMENT
 * ---------------------
 * The Express API exposes both a block route and a role-change route. This UI
 * intentionally uses only the block route, because the assignment requires roles
 * to be assigned on the server. No control here can promote or demote an account.
 *
 * Extra safety rules:
 * - administrator rows have no block/unblock action at all
 * - the signed-in administrator cannot block themselves (the server also checks)
 * - the server's last-admin protection remains the real security boundary
 *
 * The list is filtered by search, role and blocked state on the server. Better
 * Auth user documents are serialised by Express, so password hashes and session
 * records never reach this component.
 */
interface UserFilters {
  search?: string;
  role?: UserRole;
  isBlocked?: boolean;
  // Allows the object to be passed straight to usersApi.adminList.
  [key: string]: string | number | boolean | null | undefined;
}

interface BlockTarget {
  user: User;
  nextBlocked: boolean;
}

const EMPTY_FILTERS: UserFilters = {
  search: undefined,
  role: undefined,
  isBlocked: undefined,
};

export function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [draft, setDraft] = useState<UserFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<UserFilters>(EMPTY_FILTERS);
  const [blockTarget, setBlockTarget] = useState<BlockTarget | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => usersApi.adminList(filters), [filters]);
  const filterKey = JSON.stringify(filters);

  const {
    items,
    error,
    loading,
    reload,
    replaceItem,
  } = useAdminResource<User>(load, filterKey, "We could not load users.");

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({ ...draft, search: draft.search?.trim() || undefined });
  }

  function resetFilters() {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  async function confirmBlockChange() {
    if (!blockTarget) return;

    const { user } = blockTarget;
    setBusyId(user.id);

    try {
      const updated = await usersApi.setBlocked(user.id, blockTarget.nextBlocked);
      replaceItem(updated);
      setBlockTarget(null);
      toastSuccess(
        blockTarget.nextBlocked ? "Customer blocked" : "Customer unblocked",
        `${updated.name} can ${blockTarget.nextBlocked ? "no longer" : "now"} sign in.`,
      );
    } catch (caught) {
      toastApiError(caught, "Could not change this account's blocked state.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full rounded-card" />
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-16 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load users"
        message={error}
        onRetry={reload}
      />
    );
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Users</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Review registered accounts and block or unblock customers. Roles are
            server-assigned and cannot be changed from this screen.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCw aria-hidden="true" className="h-3.5 w-3.5" />}
          onClick={reload}
        >
          Refresh
        </Button>
      </section>

      <section className="rounded-card border border-line bg-white p-5 shadow-sm">
        <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <Input
            label="Search"
            placeholder="Name or email"
            leadingIcon={<Search aria-hidden="true" className="h-4 w-4" />}
            value={draft.search ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, search: event.target.value || undefined })
            }
          />

          <Select
            label="Role"
            value={draft.role ?? ""}
            onChange={(event) =>
              setDraft({
                ...draft,
                role: event.target.value
                  ? (event.target.value as UserRole)
                  : undefined,
              })
            }
            options={[
              { value: "customer", label: "Customer" },
              { value: "admin", label: "Admin" },
            ]}
            placeholder="All roles"
          />

          <Select
            label="Account state"
            value={draft.isBlocked === undefined ? "" : String(draft.isBlocked)}
            onChange={(event) =>
              setDraft({
                ...draft,
                isBlocked:
                  event.target.value === ""
                    ? undefined
                    : event.target.value === "true",
              })
            }
            options={[
              { value: "false", label: "Active" },
              { value: "true", label: "Blocked" },
            ]}
            placeholder="All states"
          />

          <div className="flex gap-2">
            <Button type="submit" variant="primary">Apply</Button>
            <Button type="button" variant="ghost" onClick={resetFilters}>Clear</Button>
          </div>
        </form>
      </section>

      {!items || items.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a different name, email, role or account state."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          }
          icon={<Users aria-hidden="true" className="h-6 w-6" />}
        />
      ) : (
        <>
          {/* Desktop table for dense account lists; mobile cards preserve the
              same role/state information and block action without scrolling. */}
          <div className="hidden overflow-hidden rounded-card border border-line bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">
                  Registered users with role, account state and available management actions.
                </caption>
                <thead className="bg-blush-light text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-bold">Account</th>
                    <th scope="col" className="px-5 py-3 font-bold">Role</th>
                    <th scope="col" className="px-5 py-3 font-bold">Phone</th>
                    <th scope="col" className="px-5 py-3 font-bold">State</th>
                    <th scope="col" className="px-5 py-3 font-bold">Joined</th>
                    <th scope="col" className="px-5 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((item) => {
                    const isCurrentUser = item.id === currentUser?.id;
                    const canManage = item.role === "customer" && !isCurrentUser;

                    return (
                      <tr key={item.id}>
                        <td className="px-5 py-4">
                          <p className="font-bold text-plum">{item.name}</p>
                          <p className="mt-0.5 text-xs text-muted">{item.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={item.role === "admin" ? "plum" : "neutral"}>
                            {item.role === "admin" ? (
                              <ShieldCheck aria-hidden="true" className="h-3 w-3" />
                            ) : null}
                            {item.role === "admin" ? "Admin" : "Customer"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-muted">{item.phone || "—"}</td>
                        <td className="px-5 py-4">
                          <BlockedBadge isBlocked={item.isBlocked} />
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            {canManage ? (
                              <Button
                                variant={item.isBlocked ? "outline" : "ghost"}
                                size="sm"
                                loading={busyId === item.id}
                                disabled={busyId !== null}
                                className={
                                  item.isBlocked
                                    ? undefined
                                    : "text-[#B24A4A] hover:bg-[#FCEDED]"
                                }
                                onClick={() =>
                                  setBlockTarget({
                                    user: item,
                                    nextBlocked: !item.isBlocked,
                                  })
                                }
                              >
                                {item.isBlocked ? (
                                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                                ) : (
                                  <UserRoundX aria-hidden="true" className="h-3.5 w-3.5" />
                                )}
                                {item.isBlocked ? "Unblock" : "Block"}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted">
                                {isCurrentUser ? "Your account" : "Protected"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {items.map((item) => {
              const isCurrentUser = item.id === currentUser?.id;
              const canManage = item.role === "customer" && !isCurrentUser;

              return (
                <UserMobileCard
                  key={item.id}
                  user={item}
                  isCurrentUser={isCurrentUser}
                  canManage={canManage}
                  busy={busyId === item.id}
                  disabled={busyId !== null}
                  onToggleBlock={() =>
                    setBlockTarget({
                      user: item,
                      nextBlocked: !item.isBlocked,
                    })
                  }
                />
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={blockTarget !== null}
        onClose={() => setBlockTarget(null)}
        onConfirm={() => void confirmBlockChange()}
        title={blockTarget?.nextBlocked ? "Block this customer?" : "Unblock this customer?"}
        description={
          blockTarget
            ? `${blockTarget.user.name} will ${blockTarget.nextBlocked ? "lose" : "regain"} access to their SalonBook account immediately.`
            : ""
        }
        confirmLabel={blockTarget?.nextBlocked ? "Block customer" : "Unblock customer"}
        variant={blockTarget?.nextBlocked ? "danger" : "primary"}
        loading={busyId !== null}
      />
    </div>
  );
}

/**
 * Mobile user row. Role changes are still absent here: the only action is the
 * same customer-only block/unblock callback used by the desktop table.
 */
interface UserMobileCardProps {
  user: User;
  isCurrentUser: boolean;
  canManage: boolean;
  busy: boolean;
  disabled: boolean;
  onToggleBlock: () => void;
}

function UserMobileCard({
  user,
  isCurrentUser,
  canManage,
  busy,
  disabled,
  onToggleBlock,
}: UserMobileCardProps) {
  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-plum">{user.name}</p>
          <p className="mt-0.5 break-all text-xs text-muted">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={user.role === "admin" ? "plum" : "neutral"}>
            {user.role === "admin" ? "Admin" : "Customer"}
          </Badge>
          <BlockedBadge isBlocked={user.isBlocked} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-ivory p-3 text-xs">
        <div>
          <dt className="text-muted">Phone</dt>
          <dd className="mt-0.5 font-bold text-plum">{user.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Joined</dt>
          <dd className="mt-0.5 font-bold text-plum">
            {formatDate(user.createdAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-end">
        {canManage ? (
          <Button
            variant={user.isBlocked ? "outline" : "ghost"}
            size="sm"
            loading={busy}
            disabled={disabled}
            className={
              user.isBlocked ? undefined : "text-[#B24A4A] hover:bg-[#FCEDED]"
            }
            onClick={onToggleBlock}
          >
            {user.isBlocked ? (
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <UserRoundX aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            {user.isBlocked ? "Unblock customer" : "Block customer"}
          </Button>
        ) : (
          <span className="text-xs text-muted">
            {isCurrentUser ? "Your account" : "Administrator accounts are protected"}
          </span>
        )}
      </div>
    </article>
  );
}
