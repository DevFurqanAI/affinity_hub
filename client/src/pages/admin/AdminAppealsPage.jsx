import { useCallback, useEffect, useState } from "react";
import { Scale, ShieldCheck } from "lucide-react";
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
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    accepted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    rejected: "border-rose-500/20 bg-rose-500/10 text-rose-500"
  };

  return (
    classes[status] ||
    "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
  );
}

function formatExpiry(expiresAt) {
  if (!expiresAt) {
    return "Permanent";
  }

  return new Date(expiresAt).toLocaleString();
}

function AdminAppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalAppeals: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const loadAppeals = useCallback(
    async (page = 1, shouldReplace = true) => {
      try {
        setIsLoading(true);

        const result = await adminService.getAppeals({
          page,
          limit: PAGE_LIMIT,
          status: statusFilter
        });

        const loadedAppeals = result.data?.appeals || [];
        const loadedPagination = result.data?.pagination || {
          page,
          limit: PAGE_LIMIT,
          totalPages: 1,
          totalAppeals: loadedAppeals.length
        };

        setAppeals((previousAppeals) =>
          shouldReplace
            ? loadedAppeals
            : [...previousAppeals, ...loadedAppeals]
        );

        setPagination(loadedPagination);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load appeals");
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    loadAppeals(1, true);
  }, [loadAppeals]);

  const handleReviewAppeal = async (appeal, status) => {
    const actionDescription =
      status === "accepted"
        ? "accept this appeal and remove the active ban"
        : "reject this appeal and keep the ban active";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionDescription}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(appeal._id);

      const result = await adminService.reviewAppeal(appeal._id, {
        status,
        unbanUser: status === "accepted"
      });

      const updatedAppeal = result.data?.appeal;

      setAppeals((previousAppeals) =>
        previousAppeals.map((item) =>
          item._id === appeal._id ? updatedAppeal : item
        )
      );

      toast.success(
        status === "accepted"
          ? "Appeal accepted and ban removed"
          : "Appeal rejected"
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to review appeal");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <PageContainer
      title="Appeals Review"
      subtitle="Review ban appeals and restore access only when moderation decisions should be reversed."
      maxWidth="max-w-7xl"
    >
      <AdminNavigation />

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Pending", value: "pending" },
            { label: "Accepted", value: "accepted" },
            { label: "Rejected", value: "rejected" }
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wide transition ${
                statusFilter === filter.value
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Card>

      {isLoading && appeals.length === 0 ? (
        <Loader text="Loading appeals..." />
      ) : null}

      {!isLoading && appeals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <ShieldCheck className="mx-auto h-7 w-7 text-emerald-500" />

          <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
            No {statusFilter} appeals
          </h2>

          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Appeals matching this status will appear here.
          </p>
        </section>
      ) : null}

      {appeals.length > 0 ? (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const isActionLoading = actionLoadingId === appeal._id;

            return (
              <section
                key={appeal._id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                      <Scale className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-[var(--color-text)]">
                        @{appeal.user?.username || "unknown"}
                      </h2>

                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {appeal.user?.email || appeal.user?.name || "User"}
                      </p>

                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                        Submitted {new Date(appeal.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClasses(
                      appeal.status
                    )}`}
                  >
                    {appeal.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-500">
                      Original Ban Reason
                    </p>

                    <p className="mt-3 text-sm leading-6 text-[var(--color-text)]">
                      {appeal.ban?.reason || "Reason unavailable"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[10px] font-black uppercase text-[var(--color-text-muted)]">
                        {formatExpiry(appeal.ban?.expiresAt)}
                      </span>

                      <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[10px] font-black uppercase text-[var(--color-text-muted)]">
                        Previous: {appeal.ban?.previousStatus || "active"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-500">
                      User Appeal Message
                    </p>

                    <p className="mt-3 text-sm leading-6 text-[var(--color-text)]">
                      {appeal.message}
                    </p>
                  </div>
                </div>

                {appeal.status === "pending" ? (
                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <Button
                      variant="outline"
                      disabled={isActionLoading}
                      onClick={() => handleReviewAppeal(appeal, "rejected")}
                    >
                      {isActionLoading ? "Processing..." : "Reject Appeal"}
                    </Button>

                    <Button
                      disabled={isActionLoading}
                      onClick={() => handleReviewAppeal(appeal, "accepted")}
                      className="!border-0 !bg-emerald-600 !text-white hover:!bg-emerald-500"
                    >
                      {isActionLoading
                        ? "Processing..."
                        : "Accept & Remove Ban"}
                    </Button>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : null}

      {pagination.page < pagination.totalPages ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => loadAppeals(pagination.page + 1, false)}
          >
            Load More Appeals
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default AdminAppealsPage;