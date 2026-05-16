import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import ReportTable from "../../components/admin/ReportTable.jsx";
import adminService from "../../services/adminService.js";

const PAGE_LIMIT = 10;

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalReports: 0
  });

  const [filters, setFilters] = useState({
    status: "",
    targetType: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadReports = async (page = 1, shouldReplace = true) => {
    try {
      setIsLoading(true);

      const result = await adminService.getReports({
        page,
        limit: PAGE_LIMIT,
        status: filters.status,
        targetType: filters.targetType
      });

      setReports((previousReports) =>
        shouldReplace
          ? result.data?.reports || []
          : [...previousReports, ...(result.data?.reports || [])]
      );

      setPagination(result.data?.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports(1, true);
  }, [filters.status, filters.targetType]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value
    }));
  };

  const handleStatusChange = async (reportId, status) => {
    try {
      setActionLoadingId(reportId);

      const result = await adminService.updateReportStatus(reportId, status);
      const updatedReport = result.data?.report;

      setReports((previousReports) =>
        previousReports.map((report) =>
          report._id === reportId ? updatedReport : report
        )
      );

      toast.success(result.message || "Report status updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update report status"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteReport = async (reportId) => {
    const confirmed = window.confirm("Are you sure you want to delete this report?");

    if (!confirmed) return;

    try {
      setActionLoadingId(reportId);

      const result = await adminService.deleteReport(reportId);

      setReports((previousReports) =>
        previousReports.filter((report) => report._id !== reportId)
      );

      setPagination((previousPagination) => ({
        ...previousPagination,
        totalReports: Math.max(previousPagination.totalReports - 1, 0)
      }));

      toast.success(result.message || "Report deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete report");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <PageContainer
      title="Reports Moderation"
      subtitle="Review, update, or delete user-submitted reports."
      maxWidth="max-w-6xl"
    >
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="rejected">Rejected</option>
            <option value="action_taken">Action Taken</option>
          </select>

          <select
            name="targetType"
            value={filters.targetType}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All Targets</option>
            <option value="user">User</option>
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="story">Story</option>
          </select>

          <Button
            variant="outline"
            onClick={() => loadReports(1, true)}
            disabled={isLoading}
            className="sm:col-span-2 lg:col-span-1"
          >
            Refresh
          </Button>
        </div>
      </Card>

      <ReportTable
        reports={reports}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onDeleteReport={handleDeleteReport}
        actionLoadingId={actionLoadingId}
      />

      {pagination.page < pagination.totalPages ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadReports(pagination.page + 1, false)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More Reports"}
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default AdminReportsPage;