import { useEffect, useState } from "react";
import {
  Ban,
  Bell,
  Flag,
  Heart,
  Mail,
  MessageCircle,
  Trash2,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";

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
      {!avatarSource || !isLoaded || hasError ? <span>{avatarText}</span> : null}

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

const getActionText = (notification) => {
  const type = notification?.type;

  if (type === "follow") {
    return "started following you";
  }

  if (type === "like") {
    return "liked your post";
  }

  if (type === "comment") {
    return "commented on your post";
  }

  if (type === "report_action") {
    return notification?.message || "updated a report";
  }

  if (type === "ban") {
    return notification?.message || "sent you a ban update";
  }

  if (type === "appeal") {
    return notification?.message || "updated your appeal";
  }

  return notification?.message || "sent you a notification";
};

const getPostPreview = (post) => {
  if (!post) {
    return "";
  }

  if (post.isDeleted) {
    return "This post is no longer available.";
  }

  if (post.caption?.trim()) {
    return post.caption.trim();
  }

  if (post.mediaType === "image") {
    return "Photo post";
  }

  if (post.mediaType === "video") {
    return "Video post";
  }

  return "Text post";
};

const getStoryPreview = (story) => {
  if (!story) {
    return "";
  }

  if (story.caption?.trim()) {
    return story.caption.trim();
  }

  if (story.mediaType === "image") {
    return "Image story";
  }

  if (story.mediaType === "video") {
    return "Video story";
  }

  return "Story";
};

function NotificationPreview({ notification }) {
  const commentPreview = notification?.comment?.content?.trim() || "";
  const postPreview = getPostPreview(notification?.post);
  const storyPreview = getStoryPreview(notification?.story);

  const previewRows = [];

  if (notification.type === "comment" && commentPreview) {
    previewRows.push({
      label: "Comment",
      text: commentPreview
    });
  }

  if (
    ["like", "comment", "report_action"].includes(notification.type) &&
    postPreview
  ) {
    previewRows.push({
      label: "Post",
      text: postPreview
    });
  }

  if (storyPreview) {
    previewRows.push({
      label: "Story",
      text: storyPreview
    });
  }

  if (previewRows.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1.5">
      {previewRows.map((row) => (
        <div
          key={`${row.label}-${row.text}`}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-rose-500">
            {row.label}
          </p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-text)]">
            {row.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function NotificationThumbnail({ notification }) {
  const post = notification?.post;
  const mediaUrl = post?.media?.url;
  const mediaType = post?.mediaType;

  if (!mediaUrl || !["image", "video"].includes(mediaType)) {
    return null;
  }

  return (
    <div className="mt-2 h-14 w-14 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      {mediaType === "image" ? (
        <img
          src={mediaUrl}
          alt={post?.caption || "Post preview"}
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          src={mediaUrl}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  index = 0,
  isBusy = false,
  compact = false,
  onMarkAsRead,
  onDelete,
  onNavigate
}) {
  const sender = notification?.sender;
  const senderProfilePath = sender?.username
    ? `/profile/${sender.username}`
    : "";

  const actorName = sender?.name || sender?.username || "System";
  const actionText = getActionText(notification);

  const createdDate = notification?.createdAt
    ? new Date(notification.createdAt).toLocaleString()
    : "";

  const handleNavigate = () => {
    onNavigate?.();
  };

  return (
    <article
      className={`relative rounded-2xl border transition ${
        compact ? "p-3" : "p-4"
      } ${
        notification.isRead
          ? "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]"
          : "border-rose-500/20 bg-rose-500/[0.05]"
      }`}
    >
      {!notification.isRead ? (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-rose-500" />
      ) : null}

      <div className="flex gap-3">
        {senderProfilePath ? (
          <Link
            to={senderProfilePath}
            onClick={handleNavigate}
            className="shrink-0"
          >
            <NotificationAvatar sender={sender} eager={index < 4} />
          </Link>
        ) : (
          <NotificationAvatar sender={sender} eager={index < 4} />
        )}

        <div className="min-w-0 flex-1 pr-3">
          <div className="flex flex-wrap items-center gap-2">
            <NotificationTypeIcon type={notification.type} />

            {senderProfilePath ? (
              <Link
                to={senderProfilePath}
                onClick={handleNavigate}
                className="truncate text-sm font-black text-[var(--color-text)] transition hover:text-rose-500"
              >
                {actorName}
              </Link>
            ) : (
              <p className="text-sm font-black text-[var(--color-text)]">
                {actorName}
              </p>
            )}

            {sender?.username ? (
              <p className="truncate text-xs text-[var(--color-text-muted)]">
                @{sender.username}
              </p>
            ) : null}
          </div>

          <p className="mt-1.5 text-sm leading-6 text-[var(--color-text)]">
            {actionText}
          </p>

          <NotificationPreview notification={notification} />
          <NotificationThumbnail notification={notification} />

          <p className="mt-2 text-[11px] font-medium capitalize text-[var(--color-text-muted)]">
            {notification.type?.replaceAll("_", " ")}
            {createdDate ? ` · ${createdDate}` : ""}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {!notification.isRead ? (
              <button
                type="button"
                onClick={() => onMarkAsRead?.(notification._id)}
                disabled={isBusy}
                className="rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-[11px] font-black text-rose-500 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "Updating..." : "Mark Read"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => onDelete?.(notification._id)}
              disabled={isBusy}
              aria-label="Delete notification"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default NotificationCard;