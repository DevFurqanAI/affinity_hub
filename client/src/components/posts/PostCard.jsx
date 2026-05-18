import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import CommentSection from "../comments/CommentSection.jsx";
import ReportModal from "../reports/ReportModal.jsx";
import likeService from "../../services/likeService.js";
import postService from "../../services/postService.js";
import useAuthStore from "../../store/authStore.js";

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

  const author = localPost.author;
  const isOwner =
    Boolean(currentUser?._id && author?._id) &&
    currentUser._id === author._id;

  const avatarText = author?.name?.charAt(0)?.toUpperCase() || "A";

  const handleLikeToggle = async () => {
    if (isLikeLoading) {
      return;
    }

    const previousLiked = isLiked;
    const previousLikesCount = likesCount;

    try {
      setIsLikeLoading(true);

      setIsLiked(!previousLiked);
      setLikesCount((count) =>
        previousLiked ? Math.max(count - 1, 0) : count + 1
      );

      const result = previousLiked
        ? await likeService.unlikePost(localPost._id)
        : await likeService.likePost(localPost._id);

      setIsLiked(result.data?.isLikedByMe);
      setLikesCount(result.data?.likesCount);
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

      const updatedPost = result.data?.post;

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
    const confirmed = window.confirm("Are you sure you want to delete this post?");

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
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/profile/${author?.username}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700"
            >
              {author?.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarText
              )}
            </Link>

            <div className="min-w-0">
              <Link
                to={`/profile/${author?.username}`}
                className="block truncate text-sm font-bold text-slate-900 hover:underline"
              >
                {author?.name}
              </Link>

              <p className="truncate text-xs text-slate-500">
                @{author?.username} ·{" "}
                {new Date(localPost.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {isOwner ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing((value) => !value)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>

                <Button size="sm" variant="danger" onClick={handleDeletePost}>
                  Delete
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsReportOpen(true)}
              >
                Report
              </Button>
            )}
          </div>
        </div>

        <div className="px-5 pb-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedCaption}
                onChange={(event) => setEditedCaption(event.target.value)}
                rows="3"
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />

              <Button onClick={handleUpdatePost} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {localPost.caption}
            </p>
          )}
        </div>

        {localPost.mediaType === "image" && localPost.media?.url ? (
          <img
            src={localPost.media.url}
            alt={localPost.caption || "Post media"}
            className="max-h-150 w-full object-cover"
          />
        ) : null}

        {localPost.mediaType === "video" && localPost.media?.url ? (
          <video
            src={localPost.media.url}
            controls
            className="max-h-150 w-full bg-black"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-4">
          <Button
            size="sm"
            variant={isLiked ? "primary" : "outline"}
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
          >
            {isLiked ? "Unlike" : "Like"} · {likesCount}
          </Button>

          <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
            Comments · {commentsCount}
          </span>

          <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold capitalize text-slate-600">
            {localPost.visibility}
          </span>
        </div>

        <CommentSection
          postId={localPost._id}
          initialCommentsCount={commentsCount}
          onCommentCountChange={handleCommentCountChange}
        />
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