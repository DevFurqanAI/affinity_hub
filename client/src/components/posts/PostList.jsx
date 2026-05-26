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
      <div className="rounded-xl border border-neutral-200 bg-white py-10 dark:border-zinc-900 dark:bg-black">
        <Loader text="Loading posts..." />
      </div>
    );
  }

  if (!isLoading && safePosts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-14 text-center dark:border-zinc-800 dark:bg-black">
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

        <h2 className="mt-4 text-base font-black text-neutral-900 dark:text-white">
          Your timeline is quiet
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-zinc-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-700 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default PostList;