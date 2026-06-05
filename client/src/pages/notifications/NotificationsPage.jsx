import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import NotificationCard from "../../components/notifications/NotificationCard.jsx";
import notificationService from "../../services/notificationService.js";
import useAuthStore from "../../store/authStore.js";

const PAGE_LIMIT = 20;

function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [busyNotificationId, setBusyNotificationId] = useState("");

  const needsEmailVerification =
    user?.authProvider === "local" && user?.isVerified === false;

  const loadNotifications = async (page = 1, shouldReplace = true) => {
    try {
      setIsLoading(true);

      const result = await notificationService.getNotifications(
        page,
        PAGE_LIMIT
      );

      const newNotifications = result.data?.notifications || [];
      const newPagination = result.data?.pagination || {
        page,
        limit: PAGE_LIMIT,
        totalPages: 1,
        totalNotifications: newNotifications.length
      };

      setNotifications((previousNotifications) =>
        shouldReplace
          ? newNotifications
          : [...previousNotifications, ...newNotifications]
      );

      setUnreadCount(result.data?.unreadCount || 0);
      setPagination(newPagination);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load notifications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1, true);
  }, []);

  if (!isAuthChecking && needsEmailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      setBusyNotificationId(notificationId);

      const result = await notificationService.markAsRead(notificationId);
      const updatedNotification = result.data?.notification;

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === notificationId
            ? updatedNotification || { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previousCount) => Math.max(previousCount - 1, 0));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    } finally {
      setBusyNotificationId("");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);

      const result = await notificationService.markAllAsRead();

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          isRead: true
        }))
      );

      setUnreadCount(0);

      toast.success(result.message || "All notifications marked as read");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark all as read"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setBusyNotificationId(notificationId);

      const notificationToDelete = notifications.find(
        (notification) => notification._id === notificationId
      );

      const result = await notificationService.deleteNotification(
        notificationId
      );

      setNotifications((previousNotifications) =>
        previousNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );

      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount((previousCount) => Math.max(previousCount - 1, 0));
      }

      toast.success(result.message || "Notification deleted");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete notification"
      );
    } finally {
      setBusyNotificationId("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">
            Activity Center
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {unreadCount === 0
              ? "You are all caught up."
              : `${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }.`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={isLoading || unreadCount === 0}
          className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Read All</span>
        </button>
      </header>

      {isLoading && notifications.length === 0 ? (
        <Loader text="Loading notifications..." />
      ) : null}

      {!isLoading && notifications.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-rose-500">
            <Bell className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
            No Notifications
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
            Likes, comments, follows and moderation updates will appear here.
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        {notifications.map((notification, index) => (
          <NotificationCard
            key={notification._id}
            notification={notification}
            index={index}
            isBusy={busyNotificationId === notification._id}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
          />
        ))}
      </section>

      {pagination.page < pagination.totalPages ? (
        <div className="flex justify-center pt-5">
          <Button
            variant="outline"
            onClick={() => loadNotifications(pagination.page + 1, false)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationsPage;