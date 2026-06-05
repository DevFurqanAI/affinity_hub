import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import CommentItem from "./CommentItem.jsx";
import commentService from "../../services/commentService.js";
import useAuthStore from "../../store/authStore.js";

const COMMENT_LIMIT = 10;

function SendIcon({ className = "" }) {
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
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

function CommentSection({
  postId,
  initialCommentsCount = 0,
  onCommentsCountChange,
  onCommentCountChange
}) {
  const user = useAuthStore((state) => state.user);

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: COMMENT_LIMIT,
    totalPages: 1,
    totalComments: initialCommentsCount
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setCommentsCount(initialCommentsCount);
  }, [initialCommentsCount]);

  const loadComments = useCallback(
    async (page = 1, shouldReplace = true) => {
      try {
        setIsLoading(true);

        const result = await commentService.getComments(
          postId,
          page,
          COMMENT_LIMIT
        );

        const newComments = result.data?.comments || [];
        const newPagination = result.data?.pagination;

        setComments((previousComments) =>
          shouldReplace ? newComments : [...previousComments, ...newComments]
        );

        if (newPagination) {
          setPagination(newPagination);

          if (typeof newPagination.totalComments === "number") {
            setCommentsCount(newPagination.totalComments);
          }
        }
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load comments";

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    setComments([]);
    setContent("");
    loadComments(1, true);
  }, [loadComments]);

  const handleCreateComment = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsCreating(true);

      const result = await commentService.createComment(postId, content);

      const newComment = result.data?.comment;
      const serverCommentsCount = result.data?.commentsCount;

      const newCommentsCount =
        typeof serverCommentsCount === "number"
          ? serverCommentsCount
          : commentsCount + 1;

      if (newComment) {
        setComments((previousComments) => [newComment, ...previousComments]);
      }

      setContent("");
      setCommentsCount(newCommentsCount);

      onCommentsCountChange?.(newCommentsCount);
      onCommentCountChange?.(newCommentsCount);

      setPagination((previousPagination) => ({
        ...previousPagination,
        totalComments: newCommentsCount
      }));

      toast.success(result.message || "Comment added successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add comment";

      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCommentUpdated = (updatedComment) => {
    if (!updatedComment?._id) {
      return;
    }

    setComments((previousComments) =>
      previousComments.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
  };

  const handleCommentDeleted = ({
    commentId,
    commentsCount: serverCommentsCount
  }) => {
    const newCommentsCount =
      typeof serverCommentsCount === "number"
        ? serverCommentsCount
        : Math.max(commentsCount - 1, 0);

    setComments((previousComments) =>
      previousComments.filter((comment) => comment._id !== commentId)
    );

    setCommentsCount(newCommentsCount);

    onCommentsCountChange?.(newCommentsCount);
    onCommentCountChange?.(newCommentsCount);

    setPagination((previousPagination) => ({
      ...previousPagination,
      totalComments: newCommentsCount
    }));
  };

  const handleLoadMore = () => {
    const nextPage = pagination.page + 1;

    loadComments(nextPage, false);
  };

  const hasMore =
    pagination?.page && pagination?.totalPages
      ? pagination.page < pagination.totalPages
      : false;

  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <section className="bg-[var(--color-surface)] px-3.5 pb-4 pt-3">
      {/* Divider / Heading */}
      <div className="mb-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Comments
        </h3>

        <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
          {commentsCount || 0}
        </span>
      </div>

      {/* New Comment Composer */}
      <form
        onSubmit={handleCreateComment}
        className="flex items-start gap-2.5 border-b border-[var(--color-border)] pb-3"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[11px] font-black text-[var(--color-text)]">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name || "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            avatarText
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-end gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 transition focus-within:border-rose-500">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows="1"
              maxLength={500}
              disabled={isCreating}
              placeholder="Add a comment..."
              className="min-h-[28px] flex-1 resize-none bg-transparent py-1 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={isCreating || !content.trim()}
              aria-label="Post comment"
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0095f6] text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-elevated)] disabled:text-[var(--color-text-muted)]"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>

          {content.length > 0 ? (
            <p className="mt-1.5 text-right text-[10px] font-bold text-[var(--color-text-muted)]">
              {content.length}/500
            </p>
          ) : null}
        </div>
      </form>

      {/* Comment Thread */}
      <div className="mt-3">
        {isLoading && comments.length === 0 ? (
          <Loader text="Loading comments..." />
        ) : null}

        {!isLoading && comments.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs font-bold text-[var(--color-text-muted)]">
              No comments yet
            </p>

            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              Start the conversation.
            </p>
          </div>
        ) : null}

        {comments.length > 0 ? (
          <div className="divide-y divide-[var(--color-border)]">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
              />
            ))}
          </div>
        ) : null}

        {isLoading && comments.length > 0 ? (
          <Loader text="Loading more comments..." />
        ) : null}

        {hasMore ? (
          <div className="flex justify-center pt-3">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Loading..." : "Load More Comments"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CommentSection;