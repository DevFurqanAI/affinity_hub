import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import AdminNavigation from "../../components/admin/AdminNavigation.jsx";
import AdminStatsCards from "../../components/admin/AdminStatsCards.jsx";
import adminService from "../../services/adminService.js";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    suspendedUsers: 0,
    deactivatedUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    actionTakenReports: 0,
    activeBans: 0
  });

  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);

      const [statsResult, reportsResult] = await Promise.all([
        adminService.getStats(),
        adminService.getReports({
          page: 1,
          limit: 5
        })
      ]);

      setStats(statsResult.data?.stats || {});
      setRecentReports(reportsResult.data?.reports || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load admin dashboard"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <PageContainer
      title="Admin Control Center"
      subtitle="Monitor community safety, reports, accounts, and active moderation actions."
      maxWidth="max-w-7xl"
      actions={
        <Button variant="outline" onClick={loadDashboard} disabled={isLoading}>
          Refresh
        </Button>
      }
    >
      <AdminNavigation />

      {isLoading ? <Loader text="Loading dashboard..." /> : null}

      <AdminStatsCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Link
          to="/admin/reports"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-rose-500/30"
        >
          <p className="text-sm font-black text-[var(--color-text)]">
            Review Reports
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            Inspect reported users and content, then apply moderation action.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-rose-500/30"
        >
          <p className="text-sm font-black text-[var(--color-text)]">
            Manage Users
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            Search accounts and apply restrictions directly.
          </p>
        </Link>

        <Link
          to="/admin/bans"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-rose-500/30"
        >
          <p className="text-sm font-black text-[var(--color-text)]">
            Manage Bans
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            Review current bans and closed moderation history.
          </p>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[var(--color-text)]">
              Recent Reports
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Latest reports submitted by community members.
            </p>
          </div>

          <Link to="/admin/reports">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {!isLoading && recentReports.length === 0 ? (
            <EmptyState
              icon="🛡️"
              title="No recent reports"
              message="New user reports will appear here."
            />
          ) : null}

          {recentReports.map((report) => (
            <div
              key={report._id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[var(--color-text)]">
                    {report.targetType.toUpperCase()} Report
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                    {report.reason}
                  </p>

                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    By @{report.reporter?.username || "unknown"} ·{" "}
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--color-text-muted)]">
                  {report.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}

export default AdminDashboardPage;