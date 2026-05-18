import { useCallback, useEffect, useState } from "react";
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
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setIsLoading(true);

        const result = await searchService.searchUsers(query, page, PAGE_LIMIT);

        setUsers((previousUsers) =>
          shouldReplace
            ? result.data?.users || []
            : [...previousUsers, ...(result.data?.users || [])]
        );

        setUserPagination(result.data?.pagination);
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
      if (!query.trim()) {
        setPosts([]);
        return;
      }

      try {
        setIsLoading(true);

        const result = await searchService.searchPosts(query, page, PAGE_LIMIT);

        setPosts((previousPosts) =>
          shouldReplace
            ? result.data?.posts || []
            : [...previousPosts, ...(result.data?.posts || [])]
        );

        setPostPagination(result.data?.pagination);
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
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Search</h1>

        <p className="mt-1 text-sm text-slate-500">
          Search users by name/username or posts by caption.
        </p>

        <div className="mt-5">
          <SearchBar initialValue={query} placeholder="Search users or posts..." />
        </div>
      </section>

      {query.trim() ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                activeTab === "users"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Users
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                activeTab === "posts"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Posts
            </button>
          </div>
        </section>
      ) : null}

      {!query.trim() ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Start Searching
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter a keyword to find users and public posts.
          </p>
        </section>
      ) : (
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
      )}
    </div>
  );
}

export default SearchPage;