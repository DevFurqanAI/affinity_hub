import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import CommentSection from "../comments/CommentSection.jsx";
import postService from "../../services/postService.js";
import likeService from "../../services/likeService.js";
import useAuthStore from "../../store/authStore.js";

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const loggedInUser = useAuthStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post?.caption || "");
  const [visibility, setVisibility] = useState(post?.visibility || "public");
  const [isLoading, setIsLoading] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [likeState, setLikeState] = useState({
    isLikedByMe: Boolean(post?.isLikedByMe),
    likesCount: post?.likesCount || 0
  });

  const [commentsCount, setCommentsCount] = useState(post?.commentsCount || 0);

  const isOwner =
    Boolean(loggedInUser?._id && post?.author?._id) &&
    loggedInUser._id === post.author._id;

  const avatarText = post?.author?.name?.charAt(0)?.toUpperCase() || "A";

  const createdDate = post?.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  const handleLikeToggle = async () => {
    if (isLikeLoading) {
      return;
    }

    const previousState = likeState;

    const optimisticState = likeState.isLikedByMe
      ? {
          isLikedByMe: false,
          likesCount: Math.max(likeState.likesCount - 1, 0)
        }
      : {
          isLikedByMe: true,
          likesCount: likeState.likesCount + 1
        };

    setLikeState(optimisticState);

    try {
      setIsLikeLoading(true);

      const result = previousState.isLikedByMe
        ? await likeService.unlikePost(post._id)
        : await likeService.likePost(post._id);

      setLikeState({
        isLikedByMe: result.data?.isLikedByMe,
        likesCount: result.data?.likesCount
      });
    } catch (error) {
      setLikeState(previousState);

      const message =
        error.response?.data?.message || "Like action failed";

      toast.error(message);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      const result = await postService.updatePost(post._id, {
        caption,
        visibility
      });

      toast.success(result.message || "Post updated successfully");

      onPostUpdated?.(result.data?.post);
      setIsEditing(false);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update post";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");

    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const result = await postService.deletePost(post._id);

      toast.success(result.message || "Post deleted successfully");

      onPostDeleted?.(post._id);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete post";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <Link
          to={`/profile/${post?.author?.username}`}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
            {post?.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-full w-full object-cover"
              />
            ) : (
              avatarText
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {post?.author?.name}
            </p>

            <p className="truncate text-xs text-slate-500">
              @{post?.author?.username} · {createdDate}
            </p>
          </div>
        </Link>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-500">
          {post?.visibility}
        </span>
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows="4"
              maxLength={1000}
              className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="public">Public</option>
              <option value="followers">Followers</option>
              <option value="private">Private</option>
            </select>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setCaption(post?.caption || "");
                  setVisibility(post?.visibility || "public");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {post?.caption ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {post.caption}
              </p>
            ) : null}

            {post?.media?.url && post?.mediaType === "image" ? (
              <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <img
                  src={post.media.url}
                  alt="Post media"
                  className="max-h-130 w-full object-cover"
                />
              </div>
            ) : null}

            {post?.media?.url && post?.mediaType === "video" ? (
              <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <video
                  src={post.media.url}
                  controls
                  className="max-h-130 w-full"
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            type="button"
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
            className={`rounded-full px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
              likeState.isLikedByMe
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {likeState.isLikedByMe ? "❤️" : "🤍"} {likeState.likesCount}{" "}
            {likeState.likesCount === 1 ? "Like" : "Likes"}
          </button>

          <button
            type="button"
            onClick={() => setShowComments((previousValue) => !previousValue)}
            className="rounded-full bg-slate-50 px-3 py-1 font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            💬 {commentsCount}{" "}
            {commentsCount === 1 ? "Comment" : "Comments"}
          </button>
        </div>

        {isOwner && !isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Edit
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {showComments ? (
        <CommentSection
          postId={post._id}
          initialCommentsCount={commentsCount}
          onCommentsCountChange={setCommentsCount}
        />
      ) : null}
    </article>
  );
}

export default PostCard;