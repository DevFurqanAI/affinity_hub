import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore.js";

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
      navigate("/feed", { replace: true });
    }
  };

  const handleError = () => {
    toast.error("Google login failed");
  };

  if (!googleClientId) {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-center text-sm font-medium text-yellow-700">
        Google login is not configured
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={isLoading ? "pointer-events-none opacity-60" : ""}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>

      <p className="text-center text-xs text-slate-400">{label}</p>
    </div>
  );
}

export default GoogleAuthButton;