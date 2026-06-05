import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import NotificationCard from "./NotificationCard.jsx";
import notificationService from "../../services/notificationService.js";

const PAGE_LIMIT = 20;

function NotificationsDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [busyNotificationId, setBusyNotificationId] = useState("");

  const loadNotifications = async (page = 1, shouldReplace = true) => {
    try {
      setIsLoading(true);

      const result = await notificationService.getNotifications(page, PAGE_LIMIT);
      const loadedNotifications = result.data?.notifications || [];

      setNotifications((previousNotifications) =>
        shouldReplace
          ? loadedNotifications
          : [...previousNotifications, ...loadedNotifications]
      );

      setUnreadCount(result.data?.unreadCount || 0);
      setPagination(
        result.data?.pagination || {
          page: 1,
          totalPages: 1
        }
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load notifications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications(1, true);
    }
  }, [isOpen]);

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
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setBusyNotificationId(notificationId);

      const selectedNotification = notifications.find(
        (notification) => notification._id === notificationId
      );

      const result = await notificationService.deleteNotification(notificationId);

      setNotifications((previousNotifications) =>
        previousNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );

      if (selectedNotification && !selectedNotification.isRead) {
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

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-label="Notifications panel"
      className="fixed bottom-0 left-[72px] top-0 z-40 hidden w-[410px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl lg:flex"
    >
      <div className="flex items-start justify-between px-7 pb-5 pt-7">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)]">
            Notifications
          </h2>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-7 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Activity
        </p>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={isLoading || unreadCount === 0}
          className="text-[11px] font-bold text-[#0095f6] transition hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {isLoading && notifications.length === 0 ? (
          <Loader text="Loading notifications..." />
        ) : null}

        {!isLoading && notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-bold text-[var(--color-text)]">
              No notifications
            </p>

            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              Likes, comments, follows, and system updates will appear here.
            </p>
          </div>
        ) : null}

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                index={index}
                compact
                isBusy={busyNotificationId === notification._id}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
                onNavigate={onClose}
              />
            ))}

            {pagination.page < pagination.totalPages ? (
              <button
                type="button"
                onClick={() => loadNotifications(pagination.page + 1, false)}
                disabled={isLoading}
                className="mt-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2.5 text-xs font-black text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:opacity-60"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default NotificationsDrawer;