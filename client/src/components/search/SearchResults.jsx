import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, SearchX, UsersRound } from "lucide-react";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import PostCard from "../posts/PostCard.jsx";

function SearchAvatar({ user, eager = false }) {
  const avatarSource = user?.avatar || "";
  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [avatarSource]);

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] text-sm font-black text-[var(--color-text-muted)]">
      {!avatarSource || !isLoaded || hasError ? <span>{avatarText}</span> : null}

      {avatarSource && !hasError ? (
        <img
          src={avatarSource}
          alt={user?.name || "User"}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}

function EmptySearchResult({ type }) {
  const isUsers = type === "users";
  const Icon = isUsers ? UsersRound : FileText;

  return (
    <section className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
        <Icon className="h-5 w-5" />
      </div>

      <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
        {isUsers ? "No Users Found" : "No Posts Found"}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
        {isUsers
          ? "Try searching with a different name or username."
          : "Try searching with a different caption keyword."}
      </p>
    </section>
  );
}

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
      return <EmptySearchResult type="users" />;
    }

    return (
      <div className="space-y-2.5">
        {users.map((user, index) => (
          <Link
            key={user._id}
            to={`/profile/${user.username}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 transition hover:bg-[var(--color-surface-elevated)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <SearchAvatar user={user} eager={index < 4} />

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[var(--color-text)] transition group-hover:text-rose-500">
                  @{user.username}
                </p>

                <p className="mt-0.5 truncate text-xs font-medium text-[var(--color-text-muted)]">
                  {user.name}
                </p>

                {user.bio ? (
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-muted)]">
                    {user.bio}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="hidden shrink-0 text-right text-[11px] font-medium text-[var(--color-text-muted)] sm:block">
              <p>{user.followersCount || 0} followers</p>
              <p className="mt-1">{user.followingCount || 0} following</p>
            </div>
          </Link>
        ))}

        {isLoading ? <Loader text="Loading more users..." /> : null}

        {hasMoreUsers ? (
          <div className="flex justify-center pt-3">
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
    return <EmptySearchResult type="posts" />;
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
        <div className="flex justify-center pt-3">
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