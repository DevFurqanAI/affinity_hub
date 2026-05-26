import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage.jsx";
import CompleteProfilePage from "../pages/auth/CompleteProfilePage.jsx";
import ChooseInterestsPage from "../pages/auth/ChooseInterestsPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import VerifyResetOtpPage from "../pages/auth/VerifyResetOtpPage.jsx";
import NewPasswordPage from "../pages/auth/NewPasswordPage.jsx";
import BannedAccountPage from "../pages/auth/BannedAccountPage.jsx";

import ProfilePage from "../pages/profile/ProfilePage.jsx";
import HomePage from "../pages/home/HomePage.jsx";
import ExplorePage from "../pages/explore/ExplorePage.jsx";
import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";
import SearchPage from "../pages/search/SearchPage.jsx";
import SettingsPage from "../pages/settings/SettingsPage.jsx";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminReportsPage from "../pages/admin/AdminReportsPage.jsx";
import AdminUsersPage from "../pages/admin/AdminUsersPage.jsx";
import AdminBansPage from "../pages/admin/AdminBansPage.jsx";
import AdminAppealsPage from "../pages/admin/AdminAppealsPage.jsx";

import RootRedirect from "./RootRedirect.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicOnlyRoute from "./PublicOnlyRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import BannedRoute from "./BannedRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/choose-interests" element={<ChooseInterestsPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/feed" element={<Navigate to="/home" replace />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/me" element={<ProfilePage isMePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/bans" element={<AdminBansPage />} />
          <Route path="/admin/appeals" element={<AdminAppealsPage />} />
        </Route>
      </Route>

      <Route element={<BannedRoute />}>
        <Route path="/banned-account" element={<BannedAccountPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/verify" element={<VerifyResetOtpPage />} />
        <Route path="/reset-password/new" element={<NewPasswordPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;