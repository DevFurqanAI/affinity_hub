import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import searchService from "../../services/searchService.js";

const PAGE_LIMIT = 10;

function SearchDrawer({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [userPagination, setUserPagination] = useState({
    page: 1,
    totalPages: 1
  });

  const [postPagination, setPostPagination] = useState({
    page: 1,
    totalPages: 1
  });

  const loadUsers = useCallback(
    async (page = 1, shouldReplace = true) => {
      const searchValue = query.trim();

      if (!searchValue) {
        setUsers([]);
        return;
      }

      try {
        setIsLoading(true);

        const result = await searchService.searchUsers(
          searchValue,
          page,
          PAGE_LIMIT
        );

        const loadedUsers = result.data?.users || [];

        setUsers((previousUsers) =>
          shouldReplace ? loadedUsers : [...previousUsers, ...loadedUsers]
        );

        setUserPagination(
          result.data?.pagination || {
            page: 1,
            totalPages: 1
          }
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to search users");
      } finally {
        setIsLoading(false);
      }
    },
    [query]
  );

  const loadPosts = useCallback(
    async (page = 1, shouldReplace = true) => {
      const searchValue = query.trim();

      if (!searchValue) {
        setPosts([]);
        return;
      }

      try {
        setIsLoading(true);

        const result = await searchService.searchPosts(
          searchValue,
          page,
          PAGE_LIMIT
        );

        const loadedPosts = result.data?.posts || [];

        setPosts((previousPosts) =>
          shouldReplace ? loadedPosts : [...previousPosts, ...loadedPosts]
        );

        setPostPagination(
          result.data?.pagination || {
            page: 1,
            totalPages: 1
          }
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to search posts");
      } finally {
        setIsLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const searchValue = query.trim();

    if (!searchValue) {
      setUsers([]);
      setPosts([]);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (activeTab === "users") {
        loadUsers(1, true);
      } else {
        loadPosts(1, true);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, query, activeTab, loadUsers, loadPosts]);

  if (!isOpen) {
    return null;
  }

  const displayedResults = activeTab === "users" ? users : posts;

  const hasMoreUsers =
    userPagination?.page < userPagination?.totalPages;

  const hasMorePosts =
    postPagination?.page < postPagination?.totalPages;

  return (
    <section
      aria-label="Search panel"
      className="fixed bottom-0 left-[72px] top-0 z-40 hidden w-[390px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl lg:flex"
    >
      <div className="flex items-center justify-between px-7 pb-5 pt-7">
        <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)]">
          Search
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-7">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />

          <input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="w-full rounded-lg border border-transparent bg-[var(--color-surface-muted)] py-3 pl-11 pr-10 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-strong)]"
          />

          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </div>

      {query.trim() ? (
        <div className="mx-7 mt-5 grid grid-cols-2 gap-2 border-b border-[var(--color-border)] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`rounded-lg px-3 py-2 text-xs font-black transition ${
              activeTab === "users"
                ? "bg-[var(--color-surface-muted)] text-rose-500"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Users
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`rounded-lg px-3 py-2 text-xs font-black transition ${
              activeTab === "posts"
                ? "bg-[var(--color-surface-muted)] text-rose-500"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Posts
          </button>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-7 pb-7 pt-6">
        {!query.trim() ? (
          <div className="py-12 text-center">
            <p className="text-sm font-bold text-[var(--color-text)]">
              Start searching
            </p>

            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              Search users by name or username, or find posts by caption.
            </p>
          </div>
        ) : null}

        {query.trim() && isLoading && displayedResults.length === 0 ? (
          <Loader text="Searching..." />
        ) : null}

        {query.trim() && !isLoading && displayedResults.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-bold text-[var(--color-text)]">
              No results found
            </p>

            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Try another search term.
            </p>
          </div>
        ) : null}

        {activeTab === "users" && users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user) => {
              const avatarText =
                user?.name?.charAt(0)?.toUpperCase() || "A";

              return (
                <Link
                  key={user._id}
                  to={`/profile/${user.username}`}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[var(--color-surface-muted)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-sm font-black text-[var(--color-text)]">
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
                    <p className="truncate text-sm font-black text-[var(--color-text)]">
                      {user.username}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                      {user.name}
                    </p>
                  </div>
                </Link>
              );
            })}

            {hasMoreUsers ? (
              <button
                type="button"
                onClick={() => loadUsers(userPagination.page + 1, false)}
                disabled={isLoading}
                className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2.5 text-xs font-black text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:opacity-60"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            ) : null}
          </div>
        ) : null}

        {activeTab === "posts" && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => {
              const author = post.author;
              const avatarText =
                author?.name?.charAt(0)?.toUpperCase() || "A";

              return (
                <article
                  key={post._id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3"
                >
                  <Link
                    to={`/profile/${author?.username}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] text-[11px] font-black text-[var(--color-text)]">
                      {author?.avatar ? (
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        avatarText
                      )}
                    </div>

                    <p className="truncate text-xs font-black text-[var(--color-text)]">
                      {author?.username || author?.name}
                    </p>
                  </Link>

                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-[var(--color-text-muted)]">
                    {post.caption}
                  </p>

                  {post.mediaType === "image" && post.media?.url ? (
                    <img
                      src={post.media.url}
                      alt={post.caption || "Post"}
                      className="mt-3 h-28 w-full rounded-lg object-cover"
                    />
                  ) : null}
                </article>
              );
            })}

            {hasMorePosts ? (
              <button
                type="button"
                onClick={() => loadPosts(postPagination.page + 1, false)}
                disabled={isLoading}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] py-2.5 text-xs font-black text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] disabled:opacity-60"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default SearchDrawer;