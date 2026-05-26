import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Ban, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import ReportTable from "../../components/admin/ReportTable.jsx";
import AdminNavigation from "../../components/admin/AdminNavigation.jsx";
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

  const [moderationDialog, setModerationDialog] = useState({
    isOpen: false,
    report: null,
    user: null,
    action: ""
  });

  const [moderationNote, setModerationNote] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");

  const loadReports = useCallback(
    async (page = 1, shouldReplace = true) => {
      try {
        setIsLoading(true);

        const result = await adminService.getReports({
          page,
          limit: PAGE_LIMIT,
          status: filters.status,
          targetType: filters.targetType
        });

        const newReports = result.data?.reports || [];
        const newPagination = result.data?.pagination || {
          page,
          limit: PAGE_LIMIT,
          totalPages: 1,
          totalReports: newReports.length
        };

        setReports((previousReports) =>
          shouldReplace ? newReports : [...previousReports, ...newReports]
        );

        setPagination(newPagination);
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load reports";

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [filters.status, filters.targetType]
  );

  useEffect(() => {
    loadReports(1, true);
  }, [loadReports]);

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
    const confirmed = window.confirm(
      "Are you sure you want to delete this report? Reports with completed actions cannot be deleted."
    );

    if (!confirmed) {
      return;
    }

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

  const openModerationDialog = (report, user, action) => {
    const removesContent =
      action === "content_removed" ||
      action === "content_removed_and_user_banned";

    setModerationDialog({
      isOpen: true,
      report,
      user,
      action
    });

    setModerationNote(
      removesContent
        ? `Removed reported ${report.targetType} after moderation review.`
        : `Applied account restriction after reviewing reported user.`
    );

    setBanReason(
      action === "user_banned" ||
        action === "content_removed_and_user_banned"
        ? `Reported ${report.targetType}: ${report.reason}`
        : ""
    );

    setBanDuration("7");
  };

  const closeModerationDialog = () => {
    setModerationDialog({
      isOpen: false,
      report: null,
      user: null,
      action: ""
    });

    setModerationNote("");
    setBanReason("");
    setBanDuration("7");
  };

  const actionIncludesBan =
    moderationDialog.action === "user_banned" ||
    moderationDialog.action === "content_removed_and_user_banned";

  const actionRemovesContent =
    moderationDialog.action === "content_removed" ||
    moderationDialog.action === "content_removed_and_user_banned";

  const getExpiresAt = () => {
    if (banDuration === "permanent") {
      return null;
    }

    return new Date(
      Date.now() + Number(banDuration) * 24 * 60 * 60 * 1000
    ).toISOString();
  };

  const getDialogTitle = () => {
    if (moderationDialog.action === "content_removed") {
      return `Remove reported ${moderationDialog.report?.targetType}?`;
    }

    if (moderationDialog.action === "content_removed_and_user_banned") {
      return `Remove content and ban @${moderationDialog.user?.username}?`;
    }

    return `Ban @${moderationDialog.user?.username}?`;
  };

  const getConfirmLabel = () => {
    if (moderationDialog.action === "content_removed") {
      return "Remove Content";
    }

    if (moderationDialog.action === "content_removed_and_user_banned") {
      return "Remove & Ban";
    }

    return "Confirm Ban";
  };

  const handleModerationSubmit = async (event) => {
    event.preventDefault();

    const report = moderationDialog.report;

    if (!report) {
      return;
    }

    if (actionIncludesBan && banReason.trim().length < 5) {
      toast.error("Ban reason must be at least 5 characters long");
      return;
    }

    try {
      setActionLoadingId(report._id);

      const payload = {
        action: moderationDialog.action,
        moderationNote: moderationNote.trim()
      };

      if (actionIncludesBan) {
        payload.banReason = banReason.trim();
        payload.expiresAt = getExpiresAt();
      }

      const result = await adminService.takeReportAction(report._id, payload);
      const updatedReport = result.data?.report;

      setReports((previousReports) =>
        previousReports.map((existingReport) =>
          existingReport._id === report._id
            ? updatedReport
            : existingReport
        )
      );

      closeModerationDialog();

      toast.success(result.message || "Moderation action completed");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to perform moderation action";

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <PageContainer
        title="Reports Moderation"
        subtitle="Review reports, remove harmful content and restrict accounts when required."
        maxWidth="max-w-7xl"
      >
        <AdminNavigation />

        <Card>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                Moderation Filters
              </p>

              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Filter reports by review status or reported target type.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] outline-none transition focus:border-rose-500"
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
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] outline-none transition focus:border-rose-500"
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
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        <ReportTable
          reports={reports}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onDeleteReport={handleDeleteReport}
          onOpenModerationAction={openModerationDialog}
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

      {moderationDialog.isOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              actionLoadingId !== moderationDialog.report?._id
            ) {
              closeModerationDialog();
            }
          }}
        >
          <form
            onSubmit={handleModerationSubmit}
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              {actionRemovesContent ? (
                <Trash2 className="h-6 w-6" />
              ) : (
                <Ban className="h-6 w-6" />
              )}
            </div>

            <h2 className="mt-5 text-lg font-black text-[var(--color-text)]">
              {getDialogTitle()}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              {actionRemovesContent
                ? "The reported content will no longer be visible in Affinity Hub."
                : "This action will restrict the reported account from accessing normal application features."}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="moderation-note"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                >
                  Moderation Note
                </label>

                <textarea
                  id="moderation-note"
                  value={moderationNote}
                  onChange={(event) => setModerationNote(event.target.value)}
                  rows="3"
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-rose-500"
                />
              </div>

              {actionIncludesBan ? (
                <>
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
                      rows="4"
                      maxLength={500}
                      required
                      className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-rose-500"
                    />

                    <p className="mt-1 text-right text-[10px] text-[var(--color-text-muted)]">
                      {banReason.length}/500
                    </p>
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
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] outline-none transition focus:border-rose-500"
                    >
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

              <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                This action will be recorded in the moderation history and
                cannot be removed from an action-taken report.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeModerationDialog}
                disabled={actionLoadingId === moderationDialog.report?._id}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="danger"
                disabled={actionLoadingId === moderationDialog.report?._id}
              >
                {actionLoadingId === moderationDialog.report?._id
                  ? "Processing..."
                  : getConfirmLabel()}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

export default AdminReportsPage;