import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
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
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section
      aria-label="Notifications panel"
      className="fixed bottom-0 left-[72px] top-0 z-40 hidden w-[390px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl lg:flex"
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

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
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
          <div className="space-y-1">
            {notifications.map((notification) => {
              const sender = notification.sender;
              const avatarText =
                sender?.name?.charAt(0)?.toUpperCase() || "A";

              return (
                <div
                  key={notification._id}
                  className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition ${
                    notification.isRead
                      ? "hover:bg-[var(--color-surface-muted)]"
                      : "bg-[var(--color-surface-muted)]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-elevated)] text-xs font-black text-[var(--color-text)]">
                      {sender?.avatar ? (
                        <img
                          src={sender.avatar}
                          alt={sender.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        avatarText
                      )}
                    </div>

                    {!notification.isRead ? (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-[var(--color-surface)] bg-rose-500" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-5 text-[var(--color-text)]">
                      <span className="font-black">
                        {sender?.username || sender?.name || "System"}
                      </span>{" "}
                      <span className="text-[var(--color-text-muted)]">
                        {notification.message}
                      </span>
                    </p>

                    <p className="mt-1 text-[10px] font-semibold text-[var(--color-text-muted)]">
                      {notification.type?.replaceAll("_", " ")} ·{" "}
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      {!notification.isRead ? (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-[10px] font-black text-[#0095f6] hover:text-blue-500"
                        >
                          Mark read
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                        className="text-[10px] font-black text-rose-500 hover:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {pagination.page < pagination.totalPages ? (
              <button
                type="button"
                onClick={() =>
                  loadNotifications(pagination.page + 1, false)
                }
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