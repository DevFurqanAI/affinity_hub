import Loader from "../common/Loader.jsx";
import Button from "../common/Button.jsx";
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
  const hasMore =
    pagination?.page && pagination?.totalPages
      ? pagination.page < pagination.totalPages
      : false;

  if (isLoading && posts.length === 0) {
    return <Loader text="Loading posts..." />;
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">No Posts Yet</h2>
        <p className="mt-2 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted}
        />
      ))}

      {isLoading ? <Loader text="Loading more posts..." /> : null}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button onClick={onLoadMore} disabled={isLoading} variant="outline">
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default PostList;