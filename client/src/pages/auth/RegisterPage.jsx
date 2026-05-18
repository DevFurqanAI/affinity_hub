import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "react-turnstile";

import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Card from "../../components/common/Card.jsx";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-xl font-black text-white">
            AH
          </div>

          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Start with email and password. You will complete your profile after OTP verification.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
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
              required
            />

            {turnstileSiteKey ? (
              <Turnstile
                sitekey={turnstileSiteKey}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken("")}
                onError={() => setCaptchaToken("")}
              />
            ) : (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                Turnstile site key is missing. Development CAPTCHA bypass is
                active.
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isRegisterDisabled}>
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <GoogleAuthButton label="Google signup skips OTP and starts profile setup." />

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-slate-900 hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}

export default RegisterPage;