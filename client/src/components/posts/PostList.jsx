import Loader from "../common/Loader.jsx";
import PostCard from "./PostCard.jsx";

function PostList({
  posts,
  isLoading,
  emptyMessage = "No posts found.",
  pagination,
  onLoadMore,
  onPostUpdated,
  onPostDeleted
}) {
  const safePosts = posts || [];

  const hasMore =
    pagination?.page && pagination?.totalPages
      ? pagination.page < pagination.totalPages
      : false;

  if (isLoading && safePosts.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-8 sm:py-10">
        <Loader text="Loading posts..." />
      </div>
    );
  }

  if (!isLoading && safePosts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-10 text-center sm:px-6 sm:py-14">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/15 to-amber-500/15">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-rose-500"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <path d="m21 15-4.5-4.5L8 19" />
          </svg>
        </div>

        <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
          Your timeline is quiet
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {safePosts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted}
        />
      ))}

      {isLoading ? (
        <div className="py-4">
          <Loader text="Loading more posts..." />
        </div>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default PostList;