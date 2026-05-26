import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import commentService from "../../services/commentService.js";
import useAuthStore from "../../store/authStore.js";

function CommentItem({ comment, onCommentUpdated, onCommentDeleted }) {
  const loggedInUser = useAuthStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment?.content || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setContent(comment?.content || "");
  }, [comment?._id, comment?.content]);

  const isOwner =
    Boolean(loggedInUser?._id && comment?.author?._id) &&
    loggedInUser._id === comment.author._id;

  const avatarText = comment?.author?.name?.charAt(0)?.toUpperCase() || "A";

  const createdDate = comment?.createdAt
    ? new Date(comment.createdAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "";

  const handleUpdate = async () => {
    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsLoading(true);

      const result = await commentService.updateComment(comment._id, content);

      const updatedComment = result.data?.comment || {
        ...comment,
        content
      };

      onCommentUpdated?.(updatedComment);
      setIsEditing(false);

      toast.success(result.message || "Comment updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update comment";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const result = await commentService.deleteComment(comment._id);

      onCommentDeleted?.({
        commentId: comment._id,
        commentsCount: result.data?.commentsCount
      });

      toast.success(result.message || "Comment deleted successfully");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete comment";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setContent(comment?.content || "");
    setIsEditing(false);
  };

  return (
    <div className="group flex items-start gap-3 py-2.5">
      {/* Avatar */}
      <Link
        to={`/profile/${comment?.author?.username}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-[11px] font-black text-neutral-700 transition-transform group-hover:scale-105 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      >
        {comment?.author?.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.name || "Comment author"}
            className="h-full w-full object-cover"
          />
        ) : (
          avatarText
        )}
      </Link>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="space-y-2.5">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows="2"
              maxLength={500}
              disabled={isLoading}
              className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-rose-500 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />

            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold text-neutral-400 dark:text-zinc-600">
                {content.length}/500
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="rounded-lg bg-neutral-100 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-60 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="rounded-lg bg-[#0095f6] px-3 py-2 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm leading-5 text-neutral-700 dark:text-zinc-300">
              <Link
                to={`/profile/${comment?.author?.username}`}
                className="mr-2 font-black text-neutral-900 hover:underline dark:text-white"
              >
                {comment?.author?.username || comment?.author?.name}
              </Link>

              {comment?.content}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              {createdDate ? (
                <span className="text-[10px] font-semibold text-neutral-400 dark:text-zinc-600">
                  {createdDate}
                </span>
              ) : null}

              {isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                    className="text-[10px] font-bold text-neutral-500 transition hover:text-neutral-900 disabled:opacity-60 dark:text-zinc-500 dark:hover:text-zinc-200"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-[10px] font-bold text-rose-500 transition hover:text-rose-600 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CommentItem;