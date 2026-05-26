import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ExplorePostGrid from "../../components/explore/ExplorePostGrid.jsx";
import postService from "../../services/postService.js";

const PAGE_LIMIT = 12;

function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalPosts: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadExplorePosts = async (page = 1, shouldReplace = true) => {
    try {
      setIsLoading(true);

      const result = await postService.getExplore(page, PAGE_LIMIT);

      const newPosts = result.data?.posts || [];
      const newPagination = result.data?.pagination || {
        page,
        limit: PAGE_LIMIT,
        totalPages: 1,
        totalPosts: newPosts.length
      };

      setPosts((previousPosts) =>
        shouldReplace ? newPosts : [...previousPosts, ...newPosts]
      );

      setPagination(newPagination);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load explore posts";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExplorePosts(1, true);
  }, []);

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

    setPagination((previousPagination) => ({
      ...previousPagination,
      totalPosts: Math.max(
        (previousPagination.totalPosts || 0) - 1,
        0
      )
    }));
  };

  const handleLoadMore = () => {
    loadExplorePosts(pagination.page + 1, false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-14 pt-12 sm:px-6 lg:pt-16">
      {/* UiLab-style Explore Heading */}
      <header className="mx-auto mb-12 max-w-xl text-center">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-rose-500">
          Explore Moments
        </p>

        <h1 className="mt-4 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
          Explore the Lounge
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
          Discover public posts, student projects, campus life, and creative
          moments shared across Affinity Hub.
        </p>
      </header>

      <ExplorePostGrid
        posts={posts}
        isLoading={isLoading}
        emptyMessage="There are no public posts available to explore yet."
        pagination={pagination}
        onLoadMore={handleLoadMore}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={handlePostDeleted}
      />
    </div>
  );
}

export default ExplorePage;