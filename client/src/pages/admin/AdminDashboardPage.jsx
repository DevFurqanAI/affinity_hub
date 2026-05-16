import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import AdminStatsCards from "../../components/admin/AdminStatsCards.jsx";
import adminService from "../../services/adminService.js";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    actionTakenReports: 0,
    rejectedReports: 0
  });

  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);

      const allReportsResult = await adminService.getReports({
        page: 1,
        limit: 5
      });

      const pendingReportsResult = await adminService.getReports({
        page: 1,
        limit: 1,
        status: "pending"
      });

      const actionTakenReportsResult = await adminService.getReports({
        page: 1,
        limit: 1,
        status: "action_taken"
      });

      const rejectedReportsResult = await adminService.getReports({
        page: 1,
        limit: 1,
        status: "rejected"
      });

      setStats({
        totalReports: allReportsResult.data?.pagination?.totalReports || 0,
        pendingReports: pendingReportsResult.data?.pagination?.totalReports || 0,
        actionTakenReports:
          actionTakenReportsResult.data?.pagination?.totalReports || 0,
        rejectedReports:
          rejectedReportsResult.data?.pagination?.totalReports || 0
      });

      setRecentReports(allReportsResult.data?.reports || []);
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
      title="Admin Dashboard"
      subtitle="Monitor reports and moderation activity for Affinity Hub."
      maxWidth="max-w-6xl"
      actions={
        <Link to="/admin/reports">
          <Button className="w-full sm:w-auto">View Reports</Button>
        </Link>
      }
    >
      {isLoading ? <Loader text="Loading dashboard..." /> : null}

      <AdminStatsCards stats={stats} />

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest reports submitted by users.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadDashboard}>
            Refresh
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {!isLoading && recentReports.length === 0 ? (
            <EmptyState
              icon="🛡️"
              title="No Recent Reports"
              message="New user reports will appear here."
            />
          ) : null}

          {recentReports.map((report) => (
            <div
              key={report._id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {report.targetType.toUpperCase()} Report
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {report.reason}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    By @{report.reporter?.username || "unknown"} ·{" "}
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-bold capitalize text-white">
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