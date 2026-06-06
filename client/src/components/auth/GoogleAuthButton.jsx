import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore.js";
import { getNextOnboardingPath } from "../../utils/onboarding.js";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleAuthButton({ label = "" }) {
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

    if (!result.success) {
      return;
    }

    if (result.user?.status === "banned") {
      navigate("/banned-account", { replace: true });
      return;
    }

    navigate(getNextOnboardingPath(result.user), { replace: true });
  };

  const handleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  if (!googleClientId) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center text-xs font-semibold text-amber-500">
        Google authentication is not configured.
      </div>
    );
  }

  return (
    <div className={label ? "space-y-2" : ""}>
      <div
        className={`flex min-h-[52px] items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-white px-3 transition ${
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
          width="320"
        />
      </div>

      {label ? (
        <p className="text-center text-xs leading-5 text-[var(--color-text-muted)]">
          {label}
        </p>
      ) : null}
    </div>
  );
}

export default GoogleAuthButton;