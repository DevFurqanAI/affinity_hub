import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import notificationService from "../../services/notificationService.js";
import useAuthStore from "../../store/authStore.js";

function NotificationDropdown() {
  const dropdownRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const needsEmailVerification =
    user?.authProvider === "local" && user?.isVerified === false;

  /*
  |--------------------------------------------------------------------------
  | Important
  |--------------------------------------------------------------------------
  | Do not load notifications until:
  | - auth check is finished
  | - user exists
  | - user is verified
  */
  const canLoadNotifications =
    !isAuthChecking &&
    isAuthenticated &&
    Boolean(user?._id) &&
    !needsEmailVerification;

  const loadNotifications = useCallback(async () => {
    if (!canLoadNotifications) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);

      const result = await notificationService.getNotifications(1, 10);

      setNotifications(result.data?.notifications || []);
      setUnreadCount(result.data?.unreadCount || 0);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load notifications";

      if (error.response?.status !== 403) {
        toast.error(message);
      }

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [canLoadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    if (!canLoadNotifications) {
      setIsOpen(false);
      return;
    }

    setIsOpen((previousValue) => !previousValue);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      const updatedNotification = result.data?.notification;

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === notificationId ? updatedNotification : notification
        )
      );

      setUnreadCount((previousCount) => Math.max(previousCount - 1, 0));
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to mark notification as read";

      toast.error(message);
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
      const message =
        error.response?.data?.message || "Failed to mark all as read";

      toast.error(message);
    }
  };

  if (!canLoadNotifications) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggleDropdown}
        className="ui-icon-button relative rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
        aria-label="Open notifications"
      >
        <span className="text-xl">🔔</span>

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="ui-card absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-3xl sm:w-96">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
            <div>
              <h2 className="font-bold text-[var(--color-text)]">Notifications</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? <Loader text="Loading notifications..." /> : null}

            {!isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Likes, comments, and follows will appear here.
                </p>
              </div>
            ) : null}

            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border-b border-[var(--color-border)] p-4 ${
                  notification.isRead
                    ? "bg-[var(--color-surface)]"
                    : "bg-[var(--color-surface-muted)]"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-soft)] text-sm font-bold text-[var(--color-primary)]">
                    {notification.sender?.avatar ? (
                      <img
                        src={notification.sender.avatar}
                        alt={notification.sender.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      notification.sender?.name?.charAt(0)?.toUpperCase() || "A"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-[var(--color-text)]">
                      {notification.message}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>

                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="mt-2 text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                      >
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] p-3">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                View All Notifications
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationDropdown;
