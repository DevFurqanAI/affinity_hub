import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";
import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import notificationService from "../../services/notificationService.js";

const PAGE_LIMIT = 20;

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalNotifications: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async (page = 1, shouldReplace = true) => {
    try {
      setIsLoading(true);

      const result = await notificationService.getNotifications(page, PAGE_LIMIT);

      setNotifications((previousNotifications) =>
        shouldReplace
          ? result.data?.notifications || []
          : [...previousNotifications, ...(result.data?.notifications || [])]
      );

      setUnreadCount(result.data?.unreadCount || 0);
      setPagination(result.data?.pagination);
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
      toast.error(error.response?.data?.message || "Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notificationToDelete = notifications.find(
        (notification) => notification._id === notificationId
      );

      const result = await notificationService.deleteNotification(notificationId);

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
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      follow: "👤",
      like: "❤️",
      comment: "💬",
      report_action: "🚩",
      ban: "⛔",
      appeal: "📨"
    };

    return icons[type] || "🔔";
  };

  const user = useAuthStore((state) => state.user);
  const isAuthChecking = useAuthStore((state) => state.isAuthChecking);

  const needsEmailVerification =
    user?.authProvider === "local" && user?.isVerified === false;

  if (!isAuthChecking && needsEmailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <PageContainer
      title="Notifications"
      subtitle={`You have ${unreadCount} unread notification${
        unreadCount === 1 ? "" : "s"
      }.`}
      maxWidth="max-w-3xl"
      actions={
        <Button
          variant="outline"
          onClick={handleMarkAllAsRead}
          disabled={isLoading || unreadCount === 0}
          className="w-full sm:w-auto"
        >
          Mark All Read
        </Button>
      }
    >
      {isLoading && notifications.length === 0 ? (
        <Loader text="Loading notifications..." />
      ) : null}

      {!isLoading && notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications"
          message="Likes, comments, follows, and system messages will appear here."
        />
      ) : null}

      <div className="space-y-3">
        {notifications.map((notification) => {
          const avatarText =
            notification.sender?.name?.charAt(0)?.toUpperCase() || "A";

          return (
            <Card
              key={notification._id}
              className={notification.isRead ? "" : "bg-slate-50"}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                  {notification.sender?.avatar ? (
                    <img
                      src={notification.sender.avatar}
                      alt={notification.sender.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarText
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{getNotificationIcon(notification.type)}</span>

                    <p className="font-bold text-slate-900">
                      {notification.sender?.name || "System"}
                    </p>

                    {notification.sender?.username ? (
                      <p className="text-sm text-slate-500">
                        @{notification.sender.username}
                      </p>
                    ) : null}

                    {!notification.isRead ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                        New
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {notification.type.replace("_", " ")} ·{" "}
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {!notification.isRead ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        Mark Read
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteNotification(notification._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {pagination.page < pagination.totalPages ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadNotifications(pagination.page + 1, false)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}

export default NotificationsPage;