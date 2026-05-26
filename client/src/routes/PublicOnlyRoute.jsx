import { Navigate, Outlet } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import useAuthStore from "../store/authStore.js";
import {
  needsEmailVerification,
  needsProfileSetup,
  needsInterestsSetup
} from "../utils/onboarding.js";

function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)]">
        <Loader text="Checking session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Outlet />;
  }

  if (user.status === "banned") {
    return <Navigate to="/banned-account" replace />;
  }

  if (needsEmailVerification(user)) {
    return <Navigate to="/verify-email" replace />;
  }

  if (needsProfileSetup(user)) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (needsInterestsSetup(user)) {
    return <Navigate to="/choose-interests" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/home" replace />;
}

export default PublicOnlyRoute;