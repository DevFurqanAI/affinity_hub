import { Navigate, Outlet } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import useAuthStore from "../store/authStore.js";
import { getNextOnboardingPath } from "../utils/onboarding.js";

function BannedRoute() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)]">
        <Loader text="Checking account restriction..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status !== "banned") {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin" : getNextOnboardingPath(user)}
        replace
      />
    );
  }

  return <Outlet />;
}

export default BannedRoute;