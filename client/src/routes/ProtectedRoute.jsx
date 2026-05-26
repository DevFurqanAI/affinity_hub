import { Navigate, Outlet, useLocation } from "react-router-dom";

import Loader from "../components/common/Loader.jsx";
import useAuthStore from "../store/authStore.js";
import {
  needsEmailVerification,
  needsProfileSetup,
  needsInterestsSetup
} from "../utils/onboarding.js";

function ProtectedRoute() {
  const location = useLocation();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status === "banned") {
    return <Navigate to="/banned-account" replace />;
  }

  const currentPath = location.pathname;

  if (needsEmailVerification(user) && currentPath !== "/verify-email") {
    return <Navigate to="/verify-email" replace />;
  }

  if (
    !needsEmailVerification(user) &&
    needsProfileSetup(user) &&
    currentPath !== "/complete-profile"
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (
    !needsEmailVerification(user) &&
    !needsProfileSetup(user) &&
    needsInterestsSetup(user) &&
    currentPath !== "/choose-interests"
  ) {
    return <Navigate to="/choose-interests" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;