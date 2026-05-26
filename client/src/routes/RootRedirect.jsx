import { Navigate } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import useAuthStore from "../store/authStore.js";
import {
  needsEmailVerification,
  needsProfileSetup,
  needsInterestsSetup
} from "../utils/onboarding.js";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);

  /*
  |--------------------------------------------------------------------------
  | Wait for Session Restoration
  |--------------------------------------------------------------------------
  | App.jsx runs initializeAuth() on refresh. While the refresh-token/session
  | check is happening, do not send the user to Login prematurely.
  |--------------------------------------------------------------------------
  */
  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <Loader text="Opening Affinity Hub..." />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Public Visitor
  |--------------------------------------------------------------------------
  */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | Restricted Moderation Session
  |--------------------------------------------------------------------------
  | Banned users are authenticated only for their appeal workflow.
  |--------------------------------------------------------------------------
  */
  if (user.status === "banned") {
    return <Navigate to="/banned-account" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | Onboarding Priority
  |--------------------------------------------------------------------------
  | Do not send partially onboarded users into Home or Admin pages.
  |--------------------------------------------------------------------------
  */
  if (needsEmailVerification(user)) {
    return <Navigate to="/verify-email" replace />;
  }

  if (needsProfileSetup(user)) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (needsInterestsSetup(user)) {
    return <Navigate to="/choose-interests" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | Admin Landing Destination
  |--------------------------------------------------------------------------
  */
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | Standard Authenticated Destination
  |--------------------------------------------------------------------------
  */
  return <Navigate to="/home" replace />;
}

export default RootRedirect;