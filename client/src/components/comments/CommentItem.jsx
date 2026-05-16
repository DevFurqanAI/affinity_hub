import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import commentService from "../../services/commentService.js";
import useAuthStore from "../../store/authStore.js";

function CommentItem({ comment, onCommentUpdated, onCommentDeleted }) {
  const loggedInUser = useAuthStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment?.content || "");
  const [isLoading, setIsLoading] = useState(false);

  const isOwner =
    Boolean(loggedInUser?._id && comment?.author?._id) &&
    loggedInUser._id === comment.author._id;

  const avatarText = comment?.author?.name?.charAt(0)?.toUpperCase() || "A";

  const createdDate = comment?.createdAt
    ? new Date(comment.createdAt).toLocaleString()
    : "";

  const handleUpdate = async () => {
    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsLoading(true);

      const result = await commentService.updateComment(comment._id, content);

      toast.success(result.message || "Comment updated successfully");

      onCommentUpdated?.(result.data?.comment);
      setIsEditing(false);
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

      toast.success(result.message || "Comment deleted successfully");

      onCommentDeleted?.({
        commentId: comment._id,
        commentsCount: result.data?.commentsCount
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete comment";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-slate-700">
          {comment?.author?.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="h-full w-full object-cover"
            />
          ) : (
            avatarText
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-slate-900">
              {comment?.author?.name}
            </p>

            <p className="text-xs text-slate-500">
              @{comment?.author?.username}
            </p>

            <p className="text-xs text-slate-400">· {createdDate}</p>
          </div>

          {isEditing ? (
            <div className="mt-3 space-y-3">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows="3"
                maxLength={500}
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleUpdate} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setContent(comment?.content || "");
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {comment?.content}
            </p>
          )}

          {isOwner && !isEditing ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-60"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CommentItem;