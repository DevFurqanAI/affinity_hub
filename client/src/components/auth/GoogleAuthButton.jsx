import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore.js";
import { getNextOnboardingPath } from "../../utils/onboarding.js";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleAuthButton({ label = "Continue with Google" }) {
  const navigate = useNavigate();

  const googleAuth = useAuthStore((state) => state.googleAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;

    if (!credential) {
      toast.error("Google credential was not received");
      return;
    }

    const result = await googleAuth(credential);

    if (result.success) {
      if (result.user?.status === "banned") {
        navigate("/banned-account", { replace: true });
        return;
      }

      navigate(getNextOnboardingPath(result.user), { replace: true });
    }
  };

  const handleError = () => {
    toast.error("Google login failed");
  };

  if (!googleClientId) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center text-xs font-semibold text-amber-500">
        Google authentication is not configured.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`flex justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-white py-2 transition ${
          isLoading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          shape="pill"
          size="large"
          text="continue_with"
        />
      </div>

      {label ? (
        <p className="text-center text-[11px] leading-5 text-[var(--color-text-muted)]">
          {label}
        </p>
      ) : null}
    </div>
  );
}

export default GoogleAuthButton;