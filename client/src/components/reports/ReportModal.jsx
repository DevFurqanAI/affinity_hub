import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import reportService from "../../services/reportService.js";

function ReportModal({ isOpen, onClose, targetId, targetType = "post" }) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const resetAndClose = () => {
    if (isLoading) {
      return;
    }

    setReason("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (reason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters long");
      return;
    }

    try {
      setIsLoading(true);

      const result = await reportService.createReport({
        targetId,
        targetType,
        reason: reason.trim()
      });

      toast.success(result.message || "Report submitted successfully");

      setReason("");
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit report";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Report {targetType}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tell admins why this content should be reviewed.
            </p>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-full px-3 py-1 text-xl font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="reportReason"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Reason
            </label>

            <textarea
              id="reportReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows="5"
              maxLength={500}
              placeholder="Example: This post contains inappropriate content."
              className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {reason.length}/500
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={resetAndClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" variant="danger" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;