import { useCallback, useEffect, useState } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import AdminNavigation from "../../components/admin/AdminNavigation.jsx";
import adminService from "../../services/adminService.js";

const PAGE_LIMIT = 10;

function getBanState(ban) {
  if (ban.isActive) {
    return {
      label: "Active",
      className: "border-rose-500/20 bg-rose-500/10 text-rose-500"
    };
  }

  if (ban.endType === "expired") {
    return {
      label: "Expired",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-500"
    };
  }

  if (ban.endType === "appeal_accepted") {
    return {
      label: "Appeal Accepted",
      className: "border-blue-500/20 bg-blue-500/10 text-blue-500"
    };
  }

  return {
    label: "Removed",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
  };
}

function formatExpiry(ban) {
  if (!ban.expiresAt) {
    return "Permanent";
  }

  return new Date(ban.expiresAt).toLocaleString();
}

function AdminBansPage() {
  const [bans, setBans] = useState([]);
  const [stateFilter, setStateFilter] = useState("active");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalBans: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const loadBans = useCallback(
    async (page = 1, shouldReplace = true) => {
      try {
        setIsLoading(true);

        const result = await adminService.getBans({
          page,
          limit: PAGE_LIMIT,
          state: stateFilter
        });

        const loadedBans = result.data?.bans || [];
        const loadedPagination = result.data?.pagination || {
          page,
          limit: PAGE_LIMIT,
          totalPages: 1,
          totalBans: loadedBans.length
        };

        setBans((previousBans) =>
          shouldReplace ? loadedBans : [...previousBans, ...loadedBans]
        );

        setPagination(loadedPagination);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load bans");
      } finally {
        setIsLoading(false);
      }
    },
    [stateFilter]
  );

  useEffect(() => {
    loadBans(1, true);
  }, [loadBans]);

  const handleRemoveBan = async (banId) => {
    const confirmed = window.confirm(
      "Remove this ban and restore the user's previous account state?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(banId);

      const result = await adminService.removeBan(banId);

      toast.success(result.message || "Ban removed successfully");

      await loadBans(1, true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove ban");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <PageContainer
      title="Ban Management"
      subtitle="Review active account restrictions and closed moderation history."
      maxWidth="max-w-7xl"
    >
      <AdminNavigation />

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Active Bans", value: "active" },
            { label: "Ended Bans", value: "ended" },
            { label: "All History", value: "all" }
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStateFilter(filter.value)}
              className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wide transition ${
                stateFilter === filter.value
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Card>

      {isLoading && bans.length === 0 ? <Loader text="Loading bans..." /> : null}

      {!isLoading && bans.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <ShieldCheck className="mx-auto h-7 w-7 text-emerald-500" />

          <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
            No bans found
          </h2>
        </section>
      ) : null}

      {bans.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr>
                  {[
                    "User",
                    "Reason",
                    "Expiry",
                    "Previous State",
                    "Status",
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
                {bans.map((ban) => {
                  const status = getBanState(ban);

                  return (
                    <tr key={ban._id}>
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-[var(--color-text)]">
                          @{ban.user?.username || "unknown"}
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {ban.user?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-xs text-sm leading-6 text-[var(--color-text-muted)]">
                          {ban.reason}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-[var(--color-text-muted)]">
                        {formatExpiry(ban)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--color-text-muted)]">
                          {ban.previousStatus || "active"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {ban.isActive ? (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={actionLoadingId === ban._id}
                            onClick={() => handleRemoveBan(ban._id)}
                          >
                            {actionLoadingId === ban._id
                              ? "Removing..."
                              : "Remove Ban"}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wide text-[var(--color-text-muted)]">
                            Closed
                          </span>
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
            onClick={() => loadBans(pagination.page + 1, false)}
          >
            Load More Bans
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default AdminBansPage;