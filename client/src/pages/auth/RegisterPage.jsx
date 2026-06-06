import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "react-turnstile";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton.jsx";
import useAuthStore from "../../store/authStore.js";

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const isDevelopment = import.meta.env.DEV;

function RegisterPage() {
  const navigate = useNavigate();

  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [captchaToken, setCaptchaToken] = useState(
    !turnstileSiteKey && isDevelopment ? "dev-bypass" : ""
  );

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await register({
      ...formData,
      captchaToken
    });

    if (!result.success) {
      return;
    }

    navigate("/verify-email", { replace: true });
  };

  const isRegisterDisabled = isLoading || !captchaToken;

  return (
    <AuthShell
      eyebrow="Join Affinity Hub"
      title="Create your account"
      description="Create your secure account. Your profile and interests come next."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-black text-rose-500 transition hover:text-rose-400"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="mb-5 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            Step 1 of 3
          </p>

          <p className="mt-1 text-xs font-bold text-[var(--color-text)]">
            Secure account setup
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-7 rounded-full bg-rose-500" />
          <span className="h-1.5 w-7 rounded-full bg-[var(--color-border)]" />
          <span className="h-1.5 w-7 rounded-full bg-[var(--color-border)]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Input
          id="password"
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 6 characters"
          minLength={6}
          autoComplete="new-password"
          helper="Use at least 6 characters."
          required
        />

        {turnstileSiteKey ? (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
            <Turnstile
              sitekey={turnstileSiteKey}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken("")}
              onError={() => setCaptchaToken("")}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-5 text-amber-500">
            {isDevelopment
              ? "Development mode: CAPTCHA bypass is active."
              : "Registration CAPTCHA is not configured. Add the Turnstile site key before accepting registrations."}
          </div>
        )}

        <Button
          type="submit"
          className="w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          disabled={isRegisterDisabled}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />

        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          or
        </span>

        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <GoogleAuthButton label="Continue with Google and set up your profile next." />
    </AuthShell>
  );
}

export default RegisterPage;