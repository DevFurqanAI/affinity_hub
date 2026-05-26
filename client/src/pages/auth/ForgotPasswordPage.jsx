import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import authService from "../../services/authService.js";

const RESET_EMAIL_KEY = "affinity_hub_reset_email";
const RESET_TOKEN_KEY = "affinity_hub_reset_token";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      const result = await authService.forgotPassword(email.trim());

      sessionStorage.setItem(RESET_EMAIL_KEY, email.trim().toLowerCase());
      sessionStorage.removeItem(RESET_TOKEN_KEY);

      toast.success(result.message || "Password reset OTP requested");

      navigate("/reset-password/verify", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to request password reset"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Reset your password"
      description="Enter your email address and we will send a verification code if password recovery is available for your account."
      footer={
        <p>
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-black text-rose-500 transition hover:text-rose-400"
          >
            Return to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="forgot-password-email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <p className="text-xs leading-5 text-[var(--color-text-muted)]">
            Accounts using only Google sign-in should continue with Google
            instead of requesting a password reset.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          disabled={isLoading}
        >
          {isLoading ? "Sending Code..." : "Send Reset Code"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default ForgotPasswordPage;