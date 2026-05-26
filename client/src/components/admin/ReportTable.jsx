import {
  Ban,
  FileText,
  MessageCircle,
  ShieldAlert,
  Trash2,
  UserRound,
  Video
} from "lucide-react";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";

function getTargetUser(report) {
  if (report.targetType === "user") {
    return report.target;
  }

  if (report.targetType === "story") {
    return report.target?.user;
  }

  return report.target?.author;
}

function getTargetIcon(targetType) {
  const icons = {
    user: UserRound,
    post: FileText,
    comment: MessageCircle,
    story: Video
  };

  return icons[targetType] || ShieldAlert;
}

function getTargetDescription(report) {
  if (!report.target) {
    return "Target is unavailable or has been removed.";
  }

  if (report.targetType === "user") {
    return `@${report.target.username}`;
  }

  if (report.targetType === "post") {
    return report.target.caption || "Media post";
  }

  if (report.targetType === "comment") {
    return report.target.content || "Comment";
  }

  if (report.targetType === "story") {
    return report.target.caption || "Story media";
  }

  return "Reported content";
}

function getActionLabel(action) {
  const labels = {
    content_removed: "Content Removed",
    user_banned: "User Banned",
    content_removed_and_user_banned: "Removed + Banned"
  };

  return labels[action] || "";
}

function ReportTable({
  reports,
  isLoading,
  onStatusChange,
  onDeleteReport,
  onOpenModerationAction,
  actionLoadingId
}) {
  const getStatusBadgeClasses = (status) => {
    const classes = {
      pending: "border-amber-500/20 bg-amber-500/10 text-amber-500",
      reviewed: "border-blue-500/20 bg-blue-500/10 text-blue-500",
      rejected: "border-rose-500/20 bg-rose-500/10 text-rose-500",
      action_taken: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
    };

    return (
      classes[status] ||
      "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
    );
  };

  if (isLoading && reports.length === 0) {
    return <Loader text="Loading reports..." />;
  }

  if (!isLoading && reports.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
        <ShieldAlert className="mx-auto h-7 w-7 text-[var(--color-text-muted)]" />

        <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
          No reports found
        </h2>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Reports submitted by users will appear here.
        </p>
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-surface-muted)]">
            <tr>
              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Reporter
              </th>

              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Reported Target
              </th>

              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Reason
              </th>

              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Status
              </th>

              <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-border)]">
            {reports.map((report) => {
              const isActionLoading = actionLoadingId === report._id;
              const targetUser = getTargetUser(report);
              const TargetIcon = getTargetIcon(report.targetType);
              const isContentTarget = report.targetType !== "user";
              const isContentRemoved = Boolean(report.target?.isDeleted);

              const canTakeAction =
                report.status !== "action_taken" &&
                report.status !== "rejected";

              const canBanTarget =
                targetUser &&
                targetUser.role !== "admin" &&
                targetUser.status !== "banned";

              return (
                <tr key={report._id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-[var(--color-text)]">
                      {report.reporter?.name || "Unknown"}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      @{report.reporter?.username || "unknown"}
                    </p>

                    <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex max-w-[260px] items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-rose-500">
                        <TargetIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--color-text-muted)]">
                            {report.targetType}
                          </span>

                          {isContentRemoved ? (
                            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-500">
                              Removed
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--color-text)]">
                          {getTargetDescription(report)}
                        </p>

                        {targetUser && report.targetType !== "user" ? (
                          <p className="mt-1 truncate text-[10px] text-[var(--color-text-muted)]">
                            Owner: @{targetUser.username}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="max-w-xs text-sm leading-6 text-[var(--color-text-muted)]">
                      {report.reason}
                    </p>

                    {report.moderationNote ? (
                      <p className="mt-3 max-w-xs border-l-2 border-rose-500/30 pl-3 text-xs leading-5 text-[var(--color-text-muted)]">
                        Note: {report.moderationNote}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusBadgeClasses(
                        report.status
                      )}`}
                    >
                      {report.status.replace("_", " ")}
                    </span>

                    {report.moderationAction &&
                    report.moderationAction !== "none" ? (
                      <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-emerald-500">
                        {getActionLabel(report.moderationAction)}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex min-w-[235px] flex-col items-end gap-2">
                      {canTakeAction &&
                      report.targetType === "user" &&
                      canBanTarget ? (
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={isActionLoading}
                          onClick={() =>
                            onOpenModerationAction(
                              report,
                              targetUser,
                              "user_banned"
                            )
                          }
                        >
                          <Ban className="mr-1.5 h-3.5 w-3.5" />
                          Ban User
                        </Button>
                      ) : null}

                      {canTakeAction &&
                      isContentTarget &&
                      !isContentRemoved ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isActionLoading}
                            onClick={() =>
                              onOpenModerationAction(
                                report,
                                targetUser,
                                "content_removed"
                              )
                            }
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Remove
                          </Button>

                          {canBanTarget ? (
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isActionLoading}
                              onClick={() =>
                                onOpenModerationAction(
                                  report,
                                  targetUser,
                                  "content_removed_and_user_banned"
                                )
                              }
                            >
                              Remove + Ban
                            </Button>
                          ) : null}
                        </div>
                      ) : null}

                      {targetUser?.status === "banned" ? (
                        <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-rose-500">
                          User Banned
                        </span>
                      ) : null}

                      {report.status !== "action_taken" ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={
                              isActionLoading || report.status === "reviewed"
                            }
                            onClick={() =>
                              onStatusChange(report._id, "reviewed")
                            }
                          >
                            Reviewed
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              isActionLoading || report.status === "rejected"
                            }
                            onClick={() =>
                              onStatusChange(report._id, "rejected")
                            }
                          >
                            Reject
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isActionLoading}
                            onClick={() => onDeleteReport(report._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isLoading && reports.length > 0 ? (
        <div className="border-t border-[var(--color-border)]">
          <Loader text="Refreshing reports..." />
        </div>
      ) : null}
    </div>
  );
}

export default ReportTable;