import { useEffect, useState } from "react";
import {
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Play,
  X
} from "lucide-react";

import Loader from "../common/Loader.jsx";
import PostCard from "../posts/PostCard.jsx";

function ExplorePostGrid({
  posts = [],
  isLoading,
  emptyMessage = "No public posts are available yet.",
  pagination,
  onLoadMore,
  onPostUpdated,
  onPostDeleted
}) {
  const [selectedPost, setSelectedPost] = useState(null);

  const hasMore =
    pagination?.page && pagination?.totalPages
      ? pagination.page < pagination.totalPages
      : false;

  useEffect(() => {
    if (!selectedPost?._id) {
      return;
    }

    const updatedSelectedPost = posts.find(
      (post) => post._id === selectedPost._id
    );

    if (updatedSelectedPost) {
      setSelectedPost(updatedSelectedPost);
    }
  }, [posts, selectedPost?._id]);

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

  if (isLoading && posts.length === 0) {
    return (
      <div className="py-16">
        <Loader text="Discovering public posts..." />
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <section className="mx-auto max-w-lg rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/15 to-amber-500/15">
          <ImageIcon className="h-6 w-6 text-rose-500" />
        </div>

        <h2 className="mt-5 text-base font-black text-[var(--color-text)]">
          Nothing to explore yet
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
          {emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <>
      <section>
        {/* Public Posts Gallery */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {posts.map((post, index) => {
            const author = post?.author;
            const hasImage =
              post.mediaType === "image" && Boolean(post.media?.url);
            const hasVideo =
              post.mediaType === "video" && Boolean(post.media?.url);

            return (
              <button
                key={post._id}
                type="button"
                onClick={() => setSelectedPost(post)}
                aria-label={`Open post by ${
                  author?.username || author?.name || "user"
                }`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-left transition hover:border-rose-500/30"
              >
                {hasImage ? (
                  <img
                    src={post.media.url}
                    alt={post.caption || "Explore post"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : null}

                {hasVideo ? (
                  <>
                    <video
                      src={post.media.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />

                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white">
                      <Play className="ml-0.5 h-4 w-4 fill-white" />
                    </span>
                  </>
                ) : null}

                {!hasImage && !hasVideo ? (
                  <div className="flex h-full flex-col justify-between bg-gradient-to-br from-[var(--color-surface-muted)] to-[var(--color-surface-elevated)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                      Text Post
                    </p>

                    <p className="line-clamp-5 text-sm font-bold leading-6 text-[var(--color-text)]">
                      {post.caption || "Public post"}
                    </p>

                    <p className="truncate text-[11px] text-[var(--color-text-muted)]">
                      @{author?.username || "affinity_user"}
                    </p>
                  </div>
                ) : null}

                {/* Hover Information Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/65 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <div>
                    <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                      {index === 0 ? "Featured Post" : "Public Post"}
                    </p>

                    <p className="mt-2 truncate text-sm font-black text-white">
                      @{author?.username || author?.name || "affinity_user"}
                    </p>
                  </div>

                  <div>
                    {post.caption ? (
                      <p className="mb-3 line-clamp-2 text-xs leading-5 text-white/85">
                        {post.caption}
                      </p>
                    ) : null}

                    <div className="flex items-center gap-5 text-xs font-black text-white">
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4 fill-white" />
                        {post.likesCount || 0}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {isLoading && posts.length > 0 ? (
          <div className="py-8">
            <Loader text="Loading more discoveries..." />
          </div>
        ) : null}

        {hasMore ? (
          <div className="flex justify-center pt-10">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoading}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-8 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-text)] transition hover:border-rose-500/30 hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        ) : null}
      </section>

      {/* Real Post Viewer Modal */}
      {selectedPost ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPost(null);
            }
          }}
        >
          <div
            className="relative max-h-[94vh] w-full max-w-xl overflow-y-auto"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              aria-label="Close post"
              className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
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

export default ExplorePostGrid;