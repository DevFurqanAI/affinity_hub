import { useEffect, useState } from "react";
import {
  Ban,
  Bell,
  CheckCheck,
  Flag,
  Heart,
  Mail,
  MessageCircle,
  Trash2,
  UserPlus
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import notificationService from "../../services/notificationService.js";
import useAuthStore from "../../store/authStore.js";

const PAGE_LIMIT = 20;

function NotificationTypeIcon({ type }) {
  const classes = "h-4 w-4 shrink-0";

  const icons = {
    follow: <UserPlus className={`${classes} text-violet-500`} />,
    like: <Heart className={`${classes} fill-rose-500 text-rose-500`} />,
    comment: <MessageCircle className={`${classes} text-sky-500`} />,
    report_action: <Flag className={`${classes} text-amber-500`} />,
    ban: <Ban className={`${classes} text-rose-500`} />,
    appeal: <Mail className={`${classes} text-emerald-500`} />
  };

  return icons[type] || <Bell className={`${classes} text-rose-500`} />;
}

function NotificationAvatar({ sender, eager = false }) {
  const avatarSource = sender?.avatar || "";
  const avatarText = sender?.name?.charAt(0)?.toUpperCase() || "A";

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [avatarSource]);

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] text-sm font-black text-[var(--color-text-muted)]">
      {!avatarSource || !isLoaded || hasError ? (
        <span>{avatarText}</span>
      ) : null}

      {avatarSource && !hasError ? (
        <img
          src={avatarSource}
          alt={sender?.name || "Notification sender"}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}

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
            ? updatedNotification
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
        {notifications.map((notification, index) => {
          const isBusy = busyNotificationId === notification._id;
          const senderProfilePath = notification.sender?.username
            ? `/profile/${notification.sender.username}`
            : "";

          return (
            <article
              key={notification._id}
              className={`relative rounded-2xl border p-4 transition ${
                notification.isRead
                  ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                  : "border-rose-500/20 bg-rose-500/[0.04]"
              }`}
            >
              {!notification.isRead ? (
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-rose-500" />
              ) : null}

              <div className="flex gap-3">
                {senderProfilePath ? (
                  <Link to={senderProfilePath} className="shrink-0">
                    <NotificationAvatar
                      sender={notification.sender}
                      eager={index < 4}
                    />
                  </Link>
                ) : (
                  <NotificationAvatar
                    sender={notification.sender}
                    eager={index < 4}
                  />
                )}

                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <NotificationTypeIcon type={notification.type} />

                    {senderProfilePath ? (
                      <Link
                        to={senderProfilePath}
                        className="truncate text-sm font-black text-[var(--color-text)] transition hover:text-rose-500"
                      >
                        {notification.sender?.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-black text-[var(--color-text)]">
                        System
                      </p>
                    )}

                    {notification.sender?.username ? (
                      <p className="truncate text-xs text-[var(--color-text-muted)]">
                        @{notification.sender.username}
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-1.5 text-sm leading-6 text-[var(--color-text)]">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-[11px] font-medium text-[var(--color-text-muted)]">
                    {notification.type.replace("_", " ")} ·{" "}
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    {!notification.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={isBusy}
                        className="rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-[11px] font-black text-rose-500 transition hover:bg-rose-500/15 disabled:opacity-60"
                      >
                        {isBusy ? "Updating..." : "Mark Read"}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteNotification(notification._id)
                      }
                      disabled={isBusy}
                      aria-label="Delete notification"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
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