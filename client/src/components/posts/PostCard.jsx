import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import CommentSection from "../comments/CommentSection.jsx";
import ReportModal from "../reports/ReportModal.jsx";
import likeService from "../../services/likeService.js";
import postService from "../../services/postService.js";
import useAuthStore from "../../store/authStore.js";
import StoryAvatar from "../stories/StoryAvatar.jsx";

function HeartIcon({ filled = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.5 5.8a5 5 0 0 0-7.1 0L12 6.2l-.4-.4a5 5 0 0 0-7.1 7.1L12 20.4l7.5-7.5a5 5 0 0 0 0-7.1Z" />
    </svg>
  );
}

function CommentIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-9.3 8.46 8.76 8.76 0 0 1-3.7-1.2L3 20l1.28-4.28A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

function MoreIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const currentUser = useAuthStore((state) => state.user);

  const [localPost, setLocalPost] = useState(post);
  const [isLiked, setIsLiked] = useState(Boolean(post.isLikedByMe));
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const optionsRef = useRef(null);
  const heartAnimationTimeoutRef = useRef(null);

  useEffect(() => {
    setLocalPost(post);
    setIsLiked(Boolean(post.isLikedByMe));
    setLikesCount(post.likesCount || 0);
    setCommentsCount(post.commentsCount || 0);
    setEditedCaption(post.caption || "");
  }, [post]);

  useEffect(() => {
    if (!isOptionsOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!optionsRef.current?.contains(event.target)) {
        setIsOptionsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOptionsOpen]);

  useEffect(() => {
    return () => {
      if (heartAnimationTimeoutRef.current) {
        window.clearTimeout(heartAnimationTimeoutRef.current);
      }
    };
  }, []);

  const author = localPost?.author;

  const isOwner =
    Boolean(currentUser?._id && author?._id) &&
    currentUser._id === author._id;

  const createdDate = localPost?.createdAt
    ? new Date(localPost.createdAt).toLocaleString()
    : "";

  const handleLikeToggle = async () => {
    if (isLikeLoading) {
      return;
    }

    const previousLiked = isLiked;
    const previousLikesCount = likesCount;
    const nextLiked = !previousLiked;
    const nextLikesCount = previousLiked
      ? Math.max(previousLikesCount - 1, 0)
      : previousLikesCount + 1;

    try {
      setIsLikeLoading(true);

      setIsLiked(nextLiked);
      setLikesCount(nextLikesCount);

      const result = previousLiked
        ? await likeService.unlikePost(localPost._id)
        : await likeService.likePost(localPost._id);

      setIsLiked(
        typeof result.data?.isLikedByMe === "boolean"
          ? result.data.isLikedByMe
          : nextLiked
      );

      setLikesCount(
        typeof result.data?.likesCount === "number"
          ? result.data.likesCount
          : nextLikesCount
      );
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousLikesCount);

      const message =
        error.response?.data?.message || "Failed to update like";

      toast.error(message);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDoubleClickLike = () => {
    setShowHeartAnimation(true);

    if (heartAnimationTimeoutRef.current) {
      window.clearTimeout(heartAnimationTimeoutRef.current);
    }

    heartAnimationTimeoutRef.current = window.setTimeout(() => {
      setShowHeartAnimation(false);
    }, 850);

    if (!isLiked && !isLikeLoading) {
      handleLikeToggle();
    }
  };

  const handleUpdatePost = async () => {
    if (!editedCaption.trim()) {
      toast.error("Caption cannot be empty");
      return;
    }

    try {
      setIsSaving(true);

      const result = await postService.updatePost(localPost._id, {
        caption: editedCaption
      });

      const updatedPost = result.data?.post || {
        ...localPost,
        caption: editedCaption
      };

      setLocalPost(updatedPost);
      onPostUpdated?.(updatedPost);
      setIsEditing(false);

      toast.success(result.message || "Post updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update post";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await postService.deletePost(localPost._id);

      onPostDeleted?.(localPost._id);

      toast.success(result.message || "Post deleted successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete post";

      toast.error(message);
    }
  };

  const handleCommentCountChange = (newCount) => {
    setCommentsCount(newCount);
  };

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow sm:rounded-xl sm:hover:shadow-sm">
        {/* Post Header */}
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-3.5">
          <div className="flex min-w-0 items-center gap-3">
           <Link to={`/profile/${author?.username}`} className="shrink-0">
            <StoryAvatar
              user={author}
              sizeClassName="h-10 w-10"
              textClassName="text-xs"
            />
          </Link>

            <div className="min-w-0">
              <Link
                to={`/profile/${author?.username}`}
                className="block truncate text-sm font-black text-[var(--color-text)] hover:underline"
              >
                {author?.name || author?.username || "Affinity User"}
              </Link>

              <p className="truncate text-[10px] font-semibold text-[var(--color-text-muted)]">
                {author?.username ? `@${author.username}` : "unknown_user"}
                {createdDate ? ` • ${createdDate}` : ""}
              </p>
            </div>
          </div>

          {/* Options Menu */}
          <div ref={optionsRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsOptionsOpen((value) => !value)}
              aria-expanded={isOptionsOpen}
              aria-label="Post options"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-rose-500"
            >
              <MoreIcon className="h-4 w-4" />
            </button>

            {isOptionsOpen ? (
              <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl">
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setIsOptionsOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
                    >
                      Edit Post
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsOptionsOpen(false);
                        handleDeletePost();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-500 transition hover:bg-rose-500/10"
                    >
                      Delete Post
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      setIsReportOpen(true);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-500 transition hover:bg-rose-500/10"
                  >
                    Report Post
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Media */}
        {localPost.mediaType === "image" && localPost.media?.url ? (
          <div
            onDoubleClick={handleDoubleClickLike}
            className="relative flex max-h-[62dvh] cursor-pointer select-none items-center justify-center overflow-hidden bg-[var(--color-surface-muted)] sm:max-h-[460px]"
          >
            <img
              src={localPost.media.url}
              alt={localPost.caption || "Post media"}
              className="max-h-[62dvh] w-full object-contain transition-transform duration-500 hover:scale-[1.01] sm:max-h-[460px]"
            />

            {showHeartAnimation ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                <HeartIcon
                  filled
                  className="h-16 w-16 scale-110 text-red-500 drop-shadow-2xl sm:h-20 sm:w-20"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {localPost.mediaType === "video" && localPost.media?.url ? (
          <div className="flex justify-center bg-black">
            <video
              src={localPost.media.url}
              controls
              playsInline
              className="max-h-[62dvh] w-full object-contain sm:max-h-[520px]"
            />
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-between px-3 pb-1.5 pt-2 sm:px-3.5 sm:pb-2 sm:pt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleLikeToggle}
              disabled={isLikeLoading}
              aria-label={isLiked ? "Unlike post" : "Like post"}
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full transition active:scale-90 hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HeartIcon
                filled={isLiked}
                className={`h-6 w-6 transition-colors ${
                  isLiked
                    ? "text-rose-500"
                    : "text-[var(--color-text)] hover:text-rose-500"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setIsCommentsOpen((value) => !value)}
              aria-expanded={isCommentsOpen}
              aria-label={isCommentsOpen ? "Hide comments" : "Show comments"}
              className="flex h-11 w-11 items-center justify-center rounded-full transition active:scale-90 hover:bg-[var(--color-surface-muted)]"
            >
              <CommentIcon
                className={`h-6 w-6 transition-colors ${
                  isCommentsOpen
                    ? "text-rose-500"
                    : "text-[var(--color-text)] hover:text-rose-500"
                }`}
              />
            </button>
          </div>

          <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            {localPost.visibility || "public"}
          </span>
        </div>

        {/* Likes, Caption and Edit Form */}
        <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5">
          <p className="text-xs font-black text-[var(--color-text)]">
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </p>

          {isEditing ? (
            <div className="mt-3 space-y-3">
              <textarea
                value={editedCaption}
                onChange={(event) => setEditedCaption(event.target.value)}
                rows="3"
                maxLength={1000}
                disabled={isSaving}
                className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-rose-500 disabled:opacity-60"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpdatePost}
                  disabled={isSaving}
                  className="rounded-lg bg-[#0095f6] px-4 py-2 text-[11px] font-black text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditedCaption(localPost.caption || "");
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                  className="rounded-lg bg-[var(--color-surface-muted)] px-4 py-2 text-[11px] font-black text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
              <Link
                to={`/profile/${author?.username}`}
                className="mr-2 font-black text-[var(--color-text)] hover:underline"
              >
                {author?.name || author?.username || "Affinity User"}
              </Link>

              {localPost.caption}
            </p>
          )}

          {!isEditing && commentsCount > 0 ? (
            <button
              type="button"
              onClick={() => setIsCommentsOpen((value) => !value)}
              className="mt-2 text-xs font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
            >
              {isCommentsOpen
                ? "Hide comments"
                : `View all ${commentsCount} ${
                    commentsCount === 1 ? "comment" : "comments"
                  }`}
            </button>
          ) : null}
        </div>

        {isCommentsOpen ? (
          <div className="border-t border-[var(--color-border)]">
            <CommentSection
              postId={localPost._id}
              initialCommentsCount={commentsCount}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>
        ) : null}
      </article>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={localPost._id}
        targetType="post"
      />
    </>
  );
}

export default PostCard;