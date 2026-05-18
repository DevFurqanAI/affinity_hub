import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Card from "../../components/common/Card.jsx";
import useAuthStore from "../../store/authStore.js";
import { getNextOnboardingPath, needsEmailVerification } from "../../utils/onboarding.js";

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
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((previousCooldown) => previousCooldown - 1);
    }, 1000);

    return () => clearTimeout(timer);
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-xl font-black text-white">
            AH
          </div>

          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Verify Email
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter the 6-digit OTP sent to your email.
          </p>

          <p className="mt-1 text-xs text-slate-400">{user?.email}</p>
        </div>

        <Card>
          <form onSubmit={handleVerify} className="space-y-5">
            <Input
              id="otp"
              label="6-digit OTP"
              value={otp}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
              }}
              placeholder="123456"
              maxLength={6}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-5">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isLoading || cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default VerifyEmailPage;