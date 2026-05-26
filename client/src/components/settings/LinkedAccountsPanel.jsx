import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link2, Mail, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import authService from "../../services/authService.js";
import useAuthStore from "../../store/authStore.js";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function StatusBadge({ children, tone = "neutral" }) {
  const classes = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    neutral:
      "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

function LinkedAccountsPanel() {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  const [security, setSecurity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleActionLoading, setIsGoogleActionLoading] = useState(false);

  const loadSecurity = async () => {
    try {
      setIsLoading(true);

      const result = await authService.getSecuritySettings();

      setSecurity(result.data?.security || null);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load linked accounts";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const handleGoogleLink = async (credentialResponse) => {
    const credential = credentialResponse?.credential;

    if (!credential) {
      toast.error("Google credential was not received");
      return;
    }

    try {
      setIsGoogleActionLoading(true);

      const result = await authService.linkGoogleAccount(credential);

      setSecurity(result.data?.security || security);
      await fetchMe();

      toast.success(result.message || "Google account connected successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to connect Google account";

      toast.error(message);
    } finally {
      setIsGoogleActionLoading(false);
    }
  };

  const handleGoogleUnlink = async () => {
    const confirmed = window.confirm(
      "Disconnect Google from your account? You will no longer be able to sign in with Google unless you reconnect it."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsGoogleActionLoading(true);

      const result = await authService.unlinkGoogleAccount();

      setSecurity(result.data?.security || security);
      await fetchMe();

      toast.success(
        result.message || "Google account disconnected successfully"
      );
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to disconnect Google account";

      toast.error(message);
    } finally {
      setIsGoogleActionLoading(false);
    }
  };

  if (isLoading) {
    return <Loader text="Loading linked accounts..." />;
  }

  if (!security) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Linked account details could not be loaded.
      </p>
    );
  }

  return (
    <div>
      <div className="border-b border-[var(--color-border)] pb-6">
        <h2 className="text-lg font-black text-[var(--color-text)]">
          Linked Accounts
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Connect sign-in methods securely to your Affinity Hub account.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {/* Email and Password */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface)] text-rose-500">
              <Mail className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-black text-[var(--color-text)]">
                Email & Password
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {security.hasPassword
                  ? "Password sign-in is available for your account."
                  : "Create a password in Account & Security to enable this method."}
              </p>
            </div>
          </div>

          {security.hasPassword ? (
            <StatusBadge tone="success">Connected</StatusBadge>
          ) : (
            <StatusBadge tone="warning">Not Set</StatusBadge>
          )}
        </div>

        {/* Google */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-blue-500">
                G
              </div>

              <div>
                <p className="text-sm font-black text-[var(--color-text)]">
                  Google
                </p>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {security.isGoogleLinked
                    ? "Google sign-in is connected to your account."
                    : "Use your matching Google email address to connect."}
                </p>
              </div>
            </div>

            {security.isGoogleLinked ? (
              <StatusBadge tone="success">Connected</StatusBadge>
            ) : (
              <StatusBadge>Not Connected</StatusBadge>
            )}
          </div>

          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            {security.isGoogleLinked ? (
              <>
                <button
                  type="button"
                  onClick={handleGoogleUnlink}
                  disabled={
                    isGoogleActionLoading || !security.canDisconnectGoogle
                  }
                  className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-500 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isGoogleActionLoading
                    ? "Disconnecting..."
                    : "Disconnect Google"}
                </button>

                {!security.canDisconnectGoogle ? (
                  <div className="mt-3 flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                    <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                      Google is currently your only sign-in method. Create a
                      password in <strong>Account & Security</strong> before
                      disconnecting it.
                    </p>
                  </div>
                ) : null}
              </>
            ) : googleClientId ? (
              <div
                className={`max-w-sm ${
                  isGoogleActionLoading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  Connect your Google account
                </p>

                <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white py-2">
                  <GoogleLogin
                    onSuccess={handleGoogleLink}
                    onError={() => toast.error("Google connection failed")}
                    theme="outline"
                    shape="pill"
                    size="large"
                    text="continue_with"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-500">
                Google authentication is not configured.
              </div>
            )}
          </div>
        </div>

        {/* Future Facebook Support */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 opacity-65 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-lg font-black text-blue-500">
              f
            </div>

            <div>
              <p className="text-sm font-black text-[var(--color-text)]">
                Facebook
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Planned integration for a future version.
              </p>
            </div>
          </div>

          <StatusBadge>Unavailable</StatusBadge>
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />

        <p className="text-xs leading-5 text-[var(--color-text-muted)]">
          For security, Google can only be connected when its email address
          matches your Affinity Hub email address.
        </p>
      </div>
    </div>
  );
}

export default LinkedAccountsPanel;