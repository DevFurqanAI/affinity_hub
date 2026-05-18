import { Navigate, Outlet } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import useAuthStore from "../store/authStore.js";
import { getNextOnboardingPath } from "../utils/onboarding.js";

function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader text="Checking authentication..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getNextOnboardingPath(user)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;