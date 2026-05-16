import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
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

  const loadUsers = async (page = 1, shouldReplace = true) => {
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
  };

  const loadPosts = async (page = 1, shouldReplace = true) => {
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
  };

  useEffect(() => {
    setUsers([]);
    setPosts([]);

    if (activeTab === "users") {
      loadUsers(1, true);
    } else {
      loadPosts(1, true);
    }
  }, [query, activeTab]);

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
    <PageContainer
      title="Search"
      subtitle="Find people by name or username, and search public posts by caption."
      maxWidth="max-w-3xl"
    >
      <Card>
        <SearchBar initialValue={query} placeholder="Search users or posts..." />
      </Card>

      {query.trim() ? (
        <Card padding="p-3">
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
        </Card>
      ) : null}

      {!query.trim() ? (
        <EmptyState
          icon="🔎"
          title="Start Searching"
          message="Enter a keyword to find users and public posts."
        />
      ) : (
        <SearchResults
          activeTab={activeTab}
          users={users}
          posts={posts}
          isLoading={isLoading}
          userPagination={userPagination}
          postPagination={postPagination}
          onLoadMoreUsers={() => loadUsers(userPagination.page + 1, false)}
          onLoadMorePosts={() => loadPosts(postPagination.page + 1, false)}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
    </PageContainer>
  );
}

export default SearchPage;