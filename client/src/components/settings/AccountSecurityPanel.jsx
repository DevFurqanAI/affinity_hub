import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  CheckCircle2,
  KeyRound,
  Link2,
  Mail,
  ShieldCheck,
  UserRound
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Loader from "../common/Loader.jsx";
import authService from "../../services/authService.js";
import useAuthStore from "../../store/authStore.js";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function StatusBadge({ children, tone = "neutral" }) {
  const classes = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-500",
    neutral:
      "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

function InformationRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
          <Icon className="h-4 w-4" />
        </div>

        <p className="text-xs font-bold text-[var(--color-text-muted)]">
          {label}
        </p>
      </div>

      <div className="min-w-0 text-right text-sm font-bold text-[var(--color-text)]">
        {value}
      </div>
    </div>
  );
}

function AccountSecurityPanel() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [security, setSecurity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const loadSecurity = async () => {
    try {
      setIsLoading(true);

      const result = await authService.getSecuritySettings();

      setSecurity(result.data?.security || null);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load account security";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const validateNewPassword = () => {
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return false;
    }

    return true;
  };

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleChangeExistingPassword = async (event) => {
    event.preventDefault();

    if (!validateNewPassword()) {
      return;
    }

    try {
      setIsPasswordLoading(true);

      const result = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (result.data?.accessToken) {
        setAccessToken(result.data.accessToken);
      }

      setSecurity(result.data?.security || security);
      resetPasswordForm();

      toast.success(result.message || "Password changed successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";

      toast.error(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleCreatePasswordWithGoogle = async (credentialResponse) => {
    const credential = credentialResponse?.credential;

    if (!credential) {
      toast.error("Google verification credential was not received");
      return;
    }

    if (!validateNewPassword()) {
      return;
    }

    try {
      setIsPasswordLoading(true);

      const result = await authService.changePassword({
        newPassword: passwordData.newPassword,
        googleCredential: credential
      });

      if (result.data?.accessToken) {
        setAccessToken(result.data.accessToken);
      }

      setSecurity(result.data?.security || security);
      resetPasswordForm();

      toast.success(result.message || "Password created successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create password";

      toast.error(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading) {
    return <Loader text="Loading account security..." />;
  }

  if (!security) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Account security details could not be loaded.
      </p>
    );
  }

  const signInLabel =
    security.isGoogleLinked && security.hasPassword
      ? "Google + Password"
      : security.isGoogleLinked
        ? "Google"
        : "Email & Password";

  return (
    <div>
      <div className="border-b border-[var(--color-border)] pb-6">
        <h2 className="text-lg font-black text-[var(--color-text)]">
          Account & Security
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          Review your account identity and manage password security.
        </p>
      </div>

      <div className="mt-5">
        <InformationRow
          label="Email Address"
          icon={Mail}
          value={security.email}
        />

        <InformationRow
          label="Available Sign-in Methods"
          icon={Link2}
          value={signInLabel}
        />

        <InformationRow
          label="Email Verification"
          icon={ShieldCheck}
          value={
            security.isVerified ? (
              <StatusBadge tone="success">Verified</StatusBadge>
            ) : (
              <StatusBadge tone="warning">Pending</StatusBadge>
            )
          }
        />

        <InformationRow
          label="Account Status"
          icon={CheckCircle2}
          value={
            security.status === "active" ? (
              <StatusBadge tone="success">Active</StatusBadge>
            ) : (
              <StatusBadge tone="danger">{security.status}</StatusBadge>
            )
          }
        />

        <InformationRow
          label="Account Created"
          icon={UserRound}
          value={formatDate(security.createdAt)}
        />

        <InformationRow
          label="Last Login"
          icon={KeyRound}
          value={formatDate(security.lastLogin)}
        />
      </div>

      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
        <h3 className="text-sm font-black text-[var(--color-text)]">
          {security.hasPassword ? "Change Password" : "Create Password"}
        </h3>

        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
          {security.hasPassword
            ? "Update your password using your current password."
            : "Add a password so you can sign in without Google and safely disconnect Google later."}
        </p>

        <form
          onSubmit={
            security.hasPassword ? handleChangeExistingPassword : undefined
          }
          className="mt-5 space-y-4"
        >
          {security.hasPassword ? (
            <Input
              id="security-current-password"
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              autoComplete="current-password"
              required
            />
          ) : null}

          <Input
            id="security-new-password"
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            required
          />

          <Input
            id="security-confirm-password"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Repeat new password"
            autoComplete="new-password"
            required
          />

          {security.hasPassword ? (
            <Button
              type="submit"
              disabled={isPasswordLoading}
              className="w-full !border-0 !bg-[#0095f6] !text-white hover:!bg-blue-600"
            >
              {isPasswordLoading ? "Updating Password..." : "Update Password"}
            </Button>
          ) : googleClientId ? (
            <div
              className={`space-y-2 ${
                isPasswordLoading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Verify with Google to create password
              </p>

              <div className="flex justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-white py-2">
                <GoogleLogin
                  onSuccess={handleCreatePasswordWithGoogle}
                  onError={() => toast.error("Google verification failed")}
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-500">
              Google authentication is not configured, so an initial password
              cannot be created here.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AccountSecurityPanel;