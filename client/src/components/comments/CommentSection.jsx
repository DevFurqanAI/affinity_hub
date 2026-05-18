import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import CommentItem from "./CommentItem.jsx";
import commentService from "../../services/commentService.js";
import useAuthStore from "../../store/authStore.js";

const PAGE_LIMIT = 10;
const COMMENT_LIMIT = 10;

function CommentSection({ postId, initialCommentsCount = 0, onCommentsCountChange }) {
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

  const loadComments = useCallback(
    async (page = 1, shouldReplace = true) => {
      try {
        setIsLoading(true);

        const result = await commentService.getComments(postId, page, PAGE_LIMIT);

        const newComments = result.data?.comments || [];
        const newPagination = result.data?.pagination;

        setComments((previousComments) =>
          shouldReplace ? newComments : [...previousComments, ...newComments]
        );

        setPagination(newPagination);
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
      const newCommentsCount = result.data?.commentsCount;

      setComments((previousComments) => [newComment, ...previousComments]);
      setContent("");
      setCommentsCount(newCommentsCount);
      onCommentsCountChange?.(newCommentsCount);

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
    setComments((previousComments) =>
      previousComments.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
  };

  const handleCommentDeleted = ({ commentId, commentsCount: newCommentsCount }) => {
    setComments((previousComments) =>
      previousComments.filter((comment) => comment._id !== commentId)
    );

    setCommentsCount(newCommentsCount);
    onCommentsCountChange?.(newCommentsCount);

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
    <section className="mt-5 border-t border-slate-100 pt-5">
      <h3 className="text-sm font-bold text-slate-900">
        Comments ({commentsCount || 0})
      </h3>

      <form onSubmit={handleCreateComment} className="mt-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-slate-700">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            avatarText
          )}
        </div>

        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows="2"
            maxLength={500}
            placeholder="Write a comment..."
            className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">{content.length}/500</p>

            <Button type="submit" size="sm" disabled={isCreating}>
              {isCreating ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {isLoading && comments.length === 0 ? (
          <Loader text="Loading comments..." />
        ) : null}

        {!isLoading && comments.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            No comments yet. Be the first to comment.
          </p>
        ) : null}

        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        ))}

        {isLoading && comments.length > 0 ? (
          <Loader text="Loading more comments..." />
        ) : null}

        {hasMore ? (
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More Comments"}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CommentSection;