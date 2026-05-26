import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, LogOut, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import banService from "../../services/banService.js";
import useAuthStore from "../../store/authStore.js";

function formatExpiry(expiresAt) {
  if (!expiresAt) {
    return "Permanent restriction";
  }

  return `Until ${new Date(expiresAt).toLocaleString()}`;
}

function getAppealStatusClasses(status) {
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

function BannedAccountPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [ban, setBan] = useState(null);
  const [appeal, setAppeal] = useState(null);
  const [canAppeal, setCanAppeal] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRestriction = async () => {
    try {
      setIsLoading(true);

      const result = await banService.getMyActiveBan();

      setBan(result.data?.ban || null);
      setAppeal(result.data?.appeal || null);
      setCanAppeal(Boolean(result.data?.canAppeal));
    } catch (error) {
      const apiMessage =
        error.response?.data?.message || "Failed to load restriction details";

      toast.error(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestriction();
  }, []);

  const handleSubmitAppeal = async (event) => {
    event.preventDefault();

    if (!ban?._id) {
      toast.error("Active ban details are unavailable");
      return;
    }

    if (message.trim().length < 10) {
      toast.error("Appeal message must be at least 10 characters long");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await banService.submitAppeal(ban._id, message.trim());

      setAppeal(result.data?.appeal || null);
      setCanAppeal(false);
      setMessage("");

      toast.success(result.message || "Appeal submitted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit appeal"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-surface)] px-4 py-8 text-[var(--color-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center">
        <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-2xl shadow-black/10 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-rose-500">
            Account Restricted
          </p>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-[var(--color-text)]">
            Your account has been banned
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            @{user?.username || "user"}, your access to Affinity Hub is
            currently restricted. You may review the moderation reason and
            submit one appeal.
          </p>

          {isLoading ? (
            <div className="mt-8">
              <Loader text="Loading restriction details..." />
            </div>
          ) : null}

          {!isLoading && ban ? (
            <>
              <div className="mt-7 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                <div className="flex items-start gap-3">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                      Moderation Reason
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--color-text)]">
                      {ban.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-[var(--color-border)] pt-4">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                      Restriction Duration
                    </p>

                    <p className="mt-2 text-sm font-bold text-[var(--color-text)]">
                      {formatExpiry(ban.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>

              {appeal ? (
                <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-black text-[var(--color-text)]">
                      Submitted Appeal
                    </h2>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getAppealStatusClasses(
                        appeal.status
                      )}`}
                    >
                      {appeal.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
                    {appeal.message}
                  </p>

                  {appeal.status === "pending" ? (
                    <p className="mt-4 text-xs leading-5 text-amber-500">
                      Your appeal is waiting for administrator review.
                    </p>
                  ) : null}

                  {appeal.status === "rejected" ? (
                    <p className="mt-4 text-xs leading-5 text-rose-500">
                      Your appeal was rejected and this restriction remains
                      active.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {canAppeal ? (
                <form onSubmit={handleSubmitAppeal} className="mt-6">
                  <label
                    htmlFor="appeal-message"
                    className="block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                  >
                    Appeal Message
                  </label>

                  <textarea
                    id="appeal-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows="5"
                    maxLength={1000}
                    placeholder="Explain respectfully why you believe this ban should be reconsidered..."
                    required
                    className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-rose-500"
                  />

                  <p className="mt-1 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
                    {message.length}/1000
                  </p>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
                  >
                    {isSubmitting ? "Submitting Appeal..." : "Submit Appeal"}
                  </Button>
                </form>
              ) : null}
            </>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3 text-xs font-black text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </section>
    </main>
  );
}

export default BannedAccountPage;