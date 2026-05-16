import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import notificationService from "../../services/notificationService.js";

function NotificationDropdown() {
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);

      const result = await notificationService.getNotifications(1, 10);

      setNotifications(result.data?.notifications || []);
      setUnreadCount(result.data?.unreadCount || 0);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load notifications";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen((previousValue) => !previousValue);

    if (!isOpen) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
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

  const handleDeleteNotification = async (notificationId) => {
    try {
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
      const message =
        error.response?.data?.message || "Failed to delete notification";

      toast.error(message);
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

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggleDropdown}
        className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
      >
        <span className="text-lg">🔔</span>

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Notifications
              </h2>
              <p className="text-xs text-slate-500">
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-3">
            {isLoading ? <Loader text="Loading notifications..." /> : null}

            {!isLoading && notifications.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : null}

            {!isLoading
              ? notifications.map((notification) => {
                  const avatarText =
                    notification.sender?.name?.charAt(0)?.toUpperCase() ||
                    "A";

                  return (
                    <div
                      key={notification._id}
                      className={`mb-2 rounded-2xl border p-3 transition ${
                        notification.isRead
                          ? "border-slate-100 bg-white"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
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
                          <div className="flex items-center gap-2">
                            <span>{getNotificationIcon(notification.type)}</span>

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {notification.sender?.name || "System"}
                            </p>

                            {!notification.isRead ? (
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                            ) : null}
                          </div>

                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {notification.message}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {!notification.isRead ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkAsRead(notification._id)
                                }
                                className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                              >
                                Mark read
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteNotification(notification._id)
                              }
                              className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>

          <div className="border-t border-slate-100 p-3">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              <Button className="w-full" variant="outline" size="sm">
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