import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import StoryBar from "../../components/stories/StoryBar.jsx";
import CreatePostBox from "../../components/posts/CreatePostBox.jsx";
import PostList from "../../components/posts/PostList.jsx";
import postService from "../../services/postService.js";

const PAGE_LIMIT = 10;

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalPosts: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadFeed = async (page = 1, shouldReplace = true) => {
    try {
      setIsLoading(true);

      const result = await postService.getFeed(page, PAGE_LIMIT);

      const newPosts = result.data?.posts || [];
      const newPagination = result.data?.pagination;

      setPosts((previousPosts) =>
        shouldReplace ? newPosts : [...previousPosts, ...newPosts]
      );

      setPagination(newPagination);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load feed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(1, true);
  }, []);

  const handlePostCreated = (newPost) => {
    if (!newPost) return;

    setPosts((previousPosts) => [newPost, ...previousPosts]);

    setPagination((previousPagination) => ({
      ...previousPagination,
      totalPosts: previousPagination.totalPosts + 1
    }));
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

    setPagination((previousPagination) => ({
      ...previousPagination,
      totalPosts: Math.max(previousPagination.totalPosts - 1, 0)
    }));
  };

  const handleLoadMore = () => {
    loadFeed(pagination.page + 1, false);
  };

  return (
    <PageContainer
      title="Your Feed"
      subtitle="Posts and stories from you and the people you follow."
      maxWidth="max-w-3xl"
    >
      <StoryBar />

      <CreatePostBox
        triggerOnly
        onPostCreated={handlePostCreated}
      />

      <PostList
        posts={posts}
        isLoading={isLoading}
        emptyMessage="Follow users or create your first post to see content here."
        pagination={pagination}
        onLoadMore={handleLoadMore}
        onPostUpdated={handlePostUpdated}
        onPostDeleted={handlePostDeleted}
      />
    </PageContainer>
  );
}

export default FeedPage;