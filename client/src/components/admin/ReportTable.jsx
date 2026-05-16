import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";

function ReportTable({
  reports,
  isLoading,
  onStatusChange,
  onDeleteReport,
  actionLoadingId
}) {
  const getStatusBadgeClasses = (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-700",
      reviewed: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
      action_taken: "bg-green-100 text-green-700"
    };

    return classes[status] || "bg-slate-100 text-slate-700";
  };

  if (isLoading && reports.length === 0) {
    return <Loader text="Loading reports..." />;
  }

  if (!isLoading && reports.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">No Reports Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          Reports submitted by users will appear here.
        </p>
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Reporter
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => {
              const isActionLoading = actionLoadingId === report._id;

              return (
                <tr key={report._id} className="align-top">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {report.reporter?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        @{report.reporter?.username || "unknown"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                      {report.targetType}
                    </span>

                    <p className="mt-2 max-w-40 truncate text-xs text-slate-400">
                      {report.targetId}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="max-w-xs text-sm leading-6 text-slate-700">
                      {report.reason}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClasses(
                        report.status
                      )}`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-500">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex min-w-52 flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isActionLoading}
                        onClick={() => onStatusChange(report._id, "reviewed")}
                      >
                        Reviewed
                      </Button>

                      <Button
                        size="sm"
                        disabled={isActionLoading}
                        onClick={() =>
                          onStatusChange(report._id, "action_taken")
                        }
                      >
                        Action
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isActionLoading}
                        onClick={() => onStatusChange(report._id, "rejected")}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isLoading && reports.length > 0 ? (
        <div className="border-t border-slate-100">
          <Loader text="Refreshing reports..." />
        </div>
      ) : null}
    </div>
  );
}

export default ReportTable;