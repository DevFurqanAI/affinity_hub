import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import authService from "../../services/authService.js";

const RESET_EMAIL_KEY = "affinity_hub_reset_email";
const RESET_TOKEN_KEY = "affinity_hub_reset_token";
const RESEND_COOLDOWN_SECONDS = 60;

function VerifyResetOtpPage() {
  const navigate = useNavigate();

  const email = sessionStorage.getItem(RESET_EMAIL_KEY) || "";

  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCooldown((previousCooldown) => previousCooldown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleVerify = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      const result = await authService.verifyPasswordResetOtp({
        email,
        otp
      });

      const resetToken = result.data?.resetToken;

      if (!resetToken) {
        throw new Error("Password reset token was not received");
      }

      sessionStorage.setItem(RESET_TOKEN_KEY, resetToken);

      toast.success(result.message || "OTP verified successfully");

      navigate("/reset-password/new", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify reset OTP";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);

      const result = await authService.forgotPassword(email);

      setOtp("");
      setCooldown(RESEND_COOLDOWN_SECONDS);

      toast.success(result.message || "Reset OTP requested");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend reset OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Security Verification"
      title="Enter reset code"
      description="Enter the 6-digit code sent to your email address."
      footer={
        <p>
          Used the wrong email?{" "}
          <Link
            to="/forgot-password"
            className="font-black text-rose-500 transition hover:text-rose-400"
          >
            Start again
          </Link>
        </p>
      }
    >
      <p className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-center text-xs font-bold text-[var(--color-text-muted)]">
        {email}
      </p>

      <form onSubmit={handleVerify} className="space-y-5">
        <Input
          id="reset-password-otp"
          label="6-digit OTP"
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
          }}
          placeholder="123456"
          maxLength={6}
          autoComplete="one-time-code"
          required
        />

        <Button
          type="submit"
          className="w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={isLoading || cooldown > 0}
        className="mt-5 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
      </button>
    </AuthShell>
  );
}

export default VerifyResetOtpPage;