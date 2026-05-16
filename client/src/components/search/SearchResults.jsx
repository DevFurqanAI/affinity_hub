import { Link } from "react-router-dom";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import PostCard from "../posts/PostCard.jsx";

function SearchResults({
  activeTab,
  users,
  posts,
  isLoading,
  userPagination,
  postPagination,
  onLoadMoreUsers,
  onLoadMorePosts,
  onPostUpdated,
  onPostDeleted
}) {
  const hasMoreUsers =
    userPagination?.page < userPagination?.totalPages;

  const hasMorePosts =
    postPagination?.page < postPagination?.totalPages;

  if (isLoading && users.length === 0 && posts.length === 0) {
    return <Loader text="Searching..." />;
  }

  if (activeTab === "users") {
    if (!isLoading && users.length === 0) {
      return (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">No Users Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Try searching with a different name or username.
          </p>
        </section>
      );
    }

    return (
      <div className="space-y-3">
        {users.map((user) => {
          const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

          return (
            <Link
              key={user._id}
              to={`/profile/${user.username}`}
              className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarText
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    @{user.username}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {user.bio || "No bio added yet."}
                  </p>
                </div>
              </div>

              <div className="hidden text-right text-xs text-slate-500 sm:block">
                <p>{user.followersCount || 0} followers</p>
                <p>{user.followingCount || 0} following</p>
              </div>
            </Link>
          );
        })}

        {isLoading ? <Loader text="Loading more users..." /> : null}

        {hasMoreUsers ? (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={onLoadMoreUsers}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More Users"}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">No Posts Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          Try searching for a different caption keyword.
        </p>
      </section>
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

      {hasMorePosts ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={onLoadMorePosts}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More Posts"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default SearchResults;