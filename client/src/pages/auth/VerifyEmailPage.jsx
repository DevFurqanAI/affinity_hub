import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import useAuthStore from "../../store/authStore.js";
import {
  getNextOnboardingPath,
  needsEmailVerification
} from "../../utils/onboarding.js";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerificationOtp = useAuthStore(
    (state) => state.resendVerificationOtp
  );

  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCooldown((previousCooldown) => previousCooldown - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldown]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!needsEmailVerification(user)) {
    return <Navigate to={getNextOnboardingPath(user)} replace />;
  }

  const handleVerify = async (event) => {
    event.preventDefault();

    const result = await verifyEmail(otp);

    if (result.success) {
      navigate("/complete-profile", { replace: true });
    }
  };

  const handleResend = async () => {
    const success = await resendVerificationOtp();

    if (success) {
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  return (
    <AuthShell
      eyebrow="Account Verification"
      title="Check your inbox"
      description="We sent a six-digit verification code to your registered email address."
      footer={
        <p className="text-xs">
          Verification helps keep Affinity Hub safer for everyone.
        </p>
      }
    >
      <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            Step 2 of 3
          </p>

          <p className="mt-1 max-w-[220px] truncate text-xs font-bold text-[var(--color-text)]">
            {user?.email}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-7 rounded-full bg-rose-500" />
          <span className="h-1.5 w-7 rounded-full bg-rose-500" />
          <span className="h-1.5 w-7 rounded-full bg-[var(--color-border)]" />
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <Input
          id="otp"
          label="Verification Code"
          value={otp}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
          }}
          placeholder="000000"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="text-center font-mono text-lg font-black tracking-[0.45em]"
          required
        />

        <Button
          type="submit"
          className="w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={isLoading || cooldown > 0}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
        </Button>
      </div>
    </AuthShell>
  );
}

export default VerifyEmailPage;