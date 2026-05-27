import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import SearchBar from "../../components/search/SearchBar.jsx";
import SearchResults from "../../components/search/SearchResults.jsx";
import searchService from "../../services/searchService.js";

const PAGE_LIMIT = 10;

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalUsers: 0
  });

  const [postPagination, setPostPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalPosts: 0
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = useCallback(
    async (page = 1, shouldReplace = true) => {
      const searchQuery = query.trim();

      if (!searchQuery) {
        setUsers([]);
        return;
      }

      try {
        setIsLoading(true);

        const result = await searchService.searchUsers(
          searchQuery,
          page,
          PAGE_LIMIT
        );

        const loadedUsers = result.data?.users || [];

        setUsers((previousUsers) =>
          shouldReplace
            ? loadedUsers
            : [...previousUsers, ...loadedUsers]
        );

        setUserPagination(
          result.data?.pagination || {
            page,
            limit: PAGE_LIMIT,
            totalPages: 1,
            totalUsers: loadedUsers.length
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
      const searchQuery = query.trim();

      if (!searchQuery) {
        setPosts([]);
        return;
      }

      try {
        setIsLoading(true);

        const result = await searchService.searchPosts(
          searchQuery,
          page,
          PAGE_LIMIT
        );

        const loadedPosts = result.data?.posts || [];

        setPosts((previousPosts) =>
          shouldReplace
            ? loadedPosts
            : [...previousPosts, ...loadedPosts]
        );

        setPostPagination(
          result.data?.pagination || {
            page,
            limit: PAGE_LIMIT,
            totalPages: 1,
            totalPosts: loadedPosts.length
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
    setUsers([]);
    setPosts([]);

    if (!query.trim()) {
      return;
    }

    if (activeTab === "users") {
      loadUsers(1, true);
    } else {
      loadPosts(1, true);
    }
  }, [query, activeTab, loadUsers, loadPosts]);

  const handleLoadMoreUsers = () => {
    loadUsers(userPagination.page + 1, false);
  };

  const handleLoadMorePosts = () => {
    loadPosts(postPagination.page + 1, false);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handlePostDeleted = (postId) => {
    setPosts((previousPosts) =>
      previousPosts.filter((post) => post._id !== postId)
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="border-b border-[var(--color-border)] pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">
          Discover
        </p>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
          Search
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
          Find students, profiles and public posts across the lounge.
        </p>

        <div className="mt-5">
          <SearchBar
            initialValue={query}
            placeholder="Search users or posts..."
          />
        </div>
      </header>

      {query.trim() ? (
        <>
          <section className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`rounded-lg px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
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
                className={`rounded-lg px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                  activeTab === "posts"
                    ? "bg-[var(--color-surface-muted)] text-rose-500"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Posts
              </button>
            </div>
          </section>

          <p className="mb-4 mt-5 text-xs font-medium text-[var(--color-text-muted)]">
            Results for{" "}
            <span className="font-bold text-[var(--color-text)]">
              “{query.trim()}”
            </span>
          </p>

          <SearchResults
            activeTab={activeTab}
            users={users}
            posts={posts}
            isLoading={isLoading}
            userPagination={userPagination}
            postPagination={postPagination}
            onLoadMoreUsers={handleLoadMoreUsers}
            onLoadMorePosts={handleLoadMorePosts}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        </>
      ) : (
        <section className="mt-6 rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-rose-500">
            <Search className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-base font-black text-[var(--color-text)]">
            Start Searching
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
            Enter a keyword to find students and public posts.
          </p>
        </section>
      )}
    </div>
  );
}

export default SearchPage;