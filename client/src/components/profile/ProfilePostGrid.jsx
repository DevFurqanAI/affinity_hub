import { useEffect, useState } from "react";
import { Heart, Image as ImageIcon, MessageCircle, X } from "lucide-react";

import Loader from "../common/Loader.jsx";
import PostCard from "../posts/PostCard.jsx";

function ProfilePostGrid({
  posts,
  isLoading,
  emptyMessage = "No posts found.",
  pagination,
  onLoadMore,
  onPostUpdated,
  onPostDeleted
}) {
  const [selectedPost, setSelectedPost] = useState(null);

  const safePosts = posts || [];

  const hasMore =
    pagination?.page && pagination?.totalPages
      ? pagination.page < pagination.totalPages
      : false;

  useEffect(() => {
    if (!selectedPost) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPost(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPost]);

  const handlePostUpdated = (updatedPost) => {
    setSelectedPost(updatedPost);
    onPostUpdated?.(updatedPost);
  };

  const handlePostDeleted = (postId) => {
    setSelectedPost(null);
    onPostDeleted?.(postId);
  };

  return (
    <>
      <section className="border-t border-[var(--color-border)] pt-3">
        {/* Published Posts Tab */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 border-t border-[var(--color-text)] px-4 pt-3 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text)]">
            <ImageIcon className="h-4 w-4" />
            <span>Published Posts</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && safePosts.length === 0 ? (
          <div className="py-12">
            <Loader text="Loading posts..." />
          </div>
        ) : null}

        {/* Empty State */}
        {!isLoading && safePosts.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
              <ImageIcon className="h-5 w-5 text-rose-500" />
            </div>

            <h2 className="mt-4 text-sm font-black text-[var(--color-text)]">
              No published posts
            </h2>

            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              {emptyMessage}
            </p>
          </div>
        ) : null}

        {/* Three-column Archive Grid */}
        {safePosts.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {safePosts.map((post) => (
              <button
                key={post._id}
                type="button"
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-left"
              >
                {post.mediaType === "image" && post.media?.url ? (
                  <img
                    src={post.media.url}
                    alt={post.caption || "Published post"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : null}

                {post.mediaType === "video" && post.media?.url ? (
                  <video
                    src={post.media.url}
                    muted
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : null}

                {(!post.mediaType || post.mediaType === "none") && (
                  <div className="flex h-full w-full items-center justify-center p-5">
                    <p className="line-clamp-5 text-center text-xs leading-5 text-[var(--color-text-muted)]">
                      {post.caption || "Text post"}
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-5 bg-black/60 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 text-xs font-black">
                    <Heart className="h-4 w-4 fill-white" />
                    {post.likesCount || 0}
                  </span>

                  <span className="flex items-center gap-1.5 text-xs font-black">
                    <MessageCircle className="h-4 w-4" />
                    {post.commentsCount || 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {isLoading && safePosts.length > 0 ? (
          <div className="py-5">
            <Loader text="Loading more posts..." />
          </div>
        ) : null}

        {hasMore ? (
          <div className="flex justify-center pt-7">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoading}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        ) : null}
      </section>

      {/* Real Post Detail / Actions Modal */}
      {selectedPost ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPost(null);
            }
          }}
        >
          <div className="relative max-h-[94vh] w-full max-w-xl overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              aria-label="Close post"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>

            <PostCard
              post={selectedPost}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ProfilePostGrid;