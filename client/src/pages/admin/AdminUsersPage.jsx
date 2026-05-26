import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  PauseCircle,
  RotateCcw,
  Search,
  UsersRound
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import AdminNavigation from "../../components/admin/AdminNavigation.jsx";
import adminService from "../../services/adminService.js";

const PAGE_LIMIT = 10;

function getStatusClasses(status) {
  const classes = {
    active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    banned: "border-rose-500/20 bg-rose-500/10 text-rose-500",
    suspended: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    deactivated:
      "border-zinc-500/20 bg-zinc-500/10 text-[var(--color-text-muted)]"
  };

  return classes[status] || classes.active;
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalUsers: 0
  });

  const [filters, setFilters] = useState({
    q: "",
    status: "",
    role: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [banUserTarget, setBanUserTarget] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");

  const [suspendUserTarget, setSuspendUserTarget] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const loadUsers = useCallback(
    async (page = 1, shouldReplace = true) => {
      try {
        setIsLoading(true);

        const result = await adminService.getUsers({
          page,
          limit: PAGE_LIMIT,
          q: filters.q,
          status: filters.status,
          role: filters.role
        });

        const loadedUsers = result.data?.users || [];
        const loadedPagination = result.data?.pagination || {
          page,
          limit: PAGE_LIMIT,
          totalPages: 1,
          totalUsers: loadedUsers.length
        };

        setUsers((previousUsers) =>
          shouldReplace ? loadedUsers : [...previousUsers, ...loadedUsers]
        );

        setPagination(loadedPagination);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    },
    [filters.q, filters.role, filters.status]
  );

  useEffect(() => {
    loadUsers(1, true);
  }, [loadUsers]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value
    }));
  };

  const openBanDialog = (user) => {
    setBanUserTarget(user);
    setBanReason("");
    setBanDuration("7");
  };

  const closeBanDialog = () => {
    setBanUserTarget(null);
    setBanReason("");
    setBanDuration("7");
  };

  const openSuspendDialog = (user) => {
    setSuspendUserTarget(user);
    setSuspensionReason("");
  };

  const closeSuspendDialog = () => {
    setSuspendUserTarget(null);
    setSuspensionReason("");
  };

  const getExpiresAt = () => {
    if (banDuration === "permanent") {
      return null;
    }

    return new Date(
      Date.now() + Number(banDuration) * 24 * 60 * 60 * 1000
    ).toISOString();
  };

  const handleBanSubmit = async (event) => {
    event.preventDefault();

    if (!banUserTarget) {
      return;
    }

    if (banReason.trim().length < 5) {
      toast.error("Ban reason must be at least 5 characters long");
      return;
    }

    try {
      setActionLoadingId(banUserTarget._id);

      const result = await adminService.banUser(banUserTarget._id, {
        reason: banReason.trim(),
        expiresAt: getExpiresAt()
      });

      toast.success(result.message || "User banned successfully");
      closeBanDialog();

      await loadUsers(1, true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to ban user");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleSuspendSubmit = async (event) => {
    event.preventDefault();

    if (!suspendUserTarget) {
      return;
    }

    if (suspensionReason.trim().length < 5) {
      toast.error("Suspension reason must be at least 5 characters long");
      return;
    }

    try {
      setActionLoadingId(suspendUserTarget._id);

      const result = await adminService.suspendUser(
        suspendUserTarget._id,
        suspensionReason.trim()
      );

      toast.success(result.message || "User suspended successfully");
      closeSuspendDialog();

      await loadUsers(1, true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRestoreAccess = async (user) => {
    const confirmed = window.confirm(
      `Restore normal application access for @${user.username}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(user._id);

      const result = await adminService.restoreUserAccess(user._id);

      toast.success(result.message || "User access restored successfully");

      await loadUsers(1, true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to restore user access"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <>
      <PageContainer
        title="User Management"
        subtitle="Search accounts, review status, and apply direct moderation actions."
        maxWidth="max-w-7xl"
      >
        <AdminNavigation />

        <Card>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              loadUsers(1, true);
            }}
            className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_160px_auto]"
          >
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />

              <input
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Search name, username or email..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-rose-500"
              />
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-rose-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>

            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-rose-500"
            >
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>

            <Button type="submit" variant="outline" disabled={isLoading}>
              Search
            </Button>
          </form>
        </Card>

        {isLoading && users.length === 0 ? (
          <Loader text="Loading users..." />
        ) : null}

        {!isLoading && users.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
            <UsersRound className="mx-auto h-7 w-7 text-[var(--color-text-muted)]" />

            <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
              No users found
            </h2>
          </section>
        ) : null}

        {users.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-border)]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    {[
                      "User",
                      "Email",
                      "Role",
                      "Status",
                      "Joined",
                      "Action"
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)] last:text-right"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-border)]">
                  {users.map((user) => {
                    const avatarText =
                      user.name?.charAt(0)?.toUpperCase() || "A";
                    const isBusy = actionLoadingId === user._id;

                    return (
                      <tr key={user._id} className="align-top">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-xs font-black text-[var(--color-text)]">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                avatarText
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-black text-[var(--color-text)]">
                                {user.name}
                              </p>

                              <p className="text-xs text-[var(--color-text-muted)]">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
                          {user.email}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--color-text-muted)]">
                            {user.role}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClasses(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>

                          {user.status === "suspended" &&
                          user.suspensionReason ? (
                            <p className="mt-2 max-w-[230px] text-xs leading-5 text-[var(--color-text-muted)]">
                              {user.suspensionReason}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {user.role === "admin" ? (
                            <span className="text-[10px] font-black uppercase tracking-wide text-[var(--color-text-muted)]">
                              Protected
                            </span>
                          ) : user.status === "banned" ? (
                            <Link
                              to="/admin/bans"
                              className="text-[10px] font-black uppercase tracking-wide text-rose-500"
                            >
                              View Bans
                            </Link>
                          ) : user.status === "suspended" ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isBusy}
                                onClick={() => handleRestoreAccess(user)}
                              >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Restore
                              </Button>

                              <Button
                                size="sm"
                                variant="danger"
                                disabled={isBusy}
                                onClick={() => openBanDialog(user)}
                              >
                                <Ban className="mr-1.5 h-3.5 w-3.5" />
                                Ban
                              </Button>
                            </div>
                          ) : user.status === "active" ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={isBusy}
                                onClick={() => openSuspendDialog(user)}
                              >
                                <PauseCircle className="mr-1.5 h-3.5 w-3.5" />
                                Suspend
                              </Button>

                              <Button
                                size="sm"
                                variant="danger"
                                disabled={isBusy}
                                onClick={() => openBanDialog(user)}
                              >
                                <Ban className="mr-1.5 h-3.5 w-3.5" />
                                Ban
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isBusy}
                              onClick={() => openBanDialog(user)}
                            >
                              <Ban className="mr-1.5 h-3.5 w-3.5" />
                              Ban
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {pagination.page < pagination.totalPages ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => loadUsers(pagination.page + 1, false)}
            >
              Load More Users
            </Button>
          </div>
        ) : null}
      </PageContainer>

      {suspendUserTarget ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              actionLoadingId !== suspendUserTarget._id
            ) {
              closeSuspendDialog();
            }
          }}
        >
          <form
            onSubmit={handleSuspendSubmit}
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <PauseCircle className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-black text-[var(--color-text)]">
              Suspend @{suspendUserTarget.username}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              This user will be blocked from normal application access until
              an admin restores the account.
            </p>

            <div className="mt-6">
              <label
                htmlFor="suspension-reason"
                className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
              >
                Suspension Reason
              </label>

              <textarea
                id="suspension-reason"
                value={suspensionReason}
                onChange={(event) => setSuspensionReason(event.target.value)}
                placeholder="Enter the administrative reason for suspension..."
                rows="4"
                maxLength={500}
                required
                className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text)] outline-none transition focus:border-amber-500"
              />

              <p className="mt-1 text-right text-[10px] text-[var(--color-text-muted)]">
                {suspensionReason.length}/500
              </p>
            </div>

            <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

              <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                Suspension does not create an appeal. Use a ban for serious
                confirmed violations that require the appeal workflow.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={actionLoadingId === suspendUserTarget._id}
                onClick={closeSuspendDialog}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="secondary"
                disabled={actionLoadingId === suspendUserTarget._id}
              >
                {actionLoadingId === suspendUserTarget._id
                  ? "Suspending..."
                  : "Confirm Suspension"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {banUserTarget ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              actionLoadingId !== banUserTarget._id
            ) {
              closeBanDialog();
            }
          }}
        >
          <form
            onSubmit={handleBanSubmit}
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <Ban className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-black text-[var(--color-text)]">
              Ban @{banUserTarget.username}?
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="ban-reason"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                >
                  Ban Reason
                </label>

                <textarea
                  id="ban-reason"
                  value={banReason}
                  onChange={(event) => setBanReason(event.target.value)}
                  placeholder="Enter moderation reason..."
                  rows="4"
                  maxLength={500}
                  required
                  className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text)] outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label
                  htmlFor="ban-duration"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                >
                  Ban Duration
                </label>

                <select
                  id="ban-duration"
                  value={banDuration}
                  onChange={(event) => setBanDuration(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-rose-500"
                >
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

              <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                A removed ban restores the previous account state safely.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={actionLoadingId === banUserTarget._id}
                onClick={closeBanDialog}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="danger"
                disabled={actionLoadingId === banUserTarget._id}
              >
                {actionLoadingId === banUserTarget._id
                  ? "Banning..."
                  : "Confirm Ban"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

export default AdminUsersPage;