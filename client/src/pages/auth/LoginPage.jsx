import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import AuthShell from "../../components/auth/AuthShell.jsx";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton.jsx";
import useAuthStore from "../../store/authStore.js";
import { getNextOnboardingPath } from "../../utils/onboarding.js";

function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

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

    const result = await login(formData);

    if (!result.success) {
      return;
    }

    if (result.user?.status === "banned") {
      navigate("/banned-account", { replace: true });
      return;
    }

    navigate(getNextOnboardingPath(result.user), { replace: true });
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to Affinity Hub"
      description="Return to your timeline, conversations, and community updates."
      footer={
        <p>
          New to Affinity Hub?{" "}
          <Link
            to="/register"
            className="font-black text-rose-500 transition hover:text-rose-400"
          >
            Create an account
          </Link>
        </p>
      }
    >
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
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <div className="-mt-2 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-rose-500 transition hover:text-rose-400"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full !border-0 !bg-gradient-to-r !from-rose-600 !to-amber-500 !text-white hover:brightness-110"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />

        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          or
        </span>

        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <GoogleAuthButton label="Continue securely with your Google account." />
    </AuthShell>
  );
}

export default LoginPage;