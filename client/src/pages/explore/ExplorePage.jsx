import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import PostList from "../../components/posts/PostList.jsx";
import postService from "../../services/postService.js";

const PAGE_LIMIT = 10;

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
      totalPosts: Math.max((previousPagination.totalPosts || 0) - 1, 0)
    }));
  };

  const handleLoadMore = () => {
    loadExplorePosts(pagination.page + 1, false);
  };

  return (
    <PageContainer
      title="Explore"
      subtitle="Discover public posts from active Affinity Hub users."
      maxWidth="max-w-3xl"
    >
      <PostList
        posts={posts}
        isLoading={isLoading}
        emptyMessage="No public posts are available yet."
        pagination={pagination}
        onLoadMore={handleLoadMore}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={handlePostDeleted}
      />
    </PageContainer>
  );
}

export default ExplorePage;