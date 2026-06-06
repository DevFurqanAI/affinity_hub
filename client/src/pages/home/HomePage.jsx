import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import StoryBar from "../../components/stories/StoryBar.jsx";
import CreatePostBox from "../../components/posts/CreatePostBox.jsx";
import PostList from "../../components/posts/PostList.jsx";
import SuggestionsSidebar from "../../components/follow/SuggestionsSidebar.jsx";
import postService from "../../services/postService.js";

const PAGE_LIMIT = 10;

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalPosts: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadHomePosts = async (page = 1, shouldReplace = true) => {
    try {
      setIsLoading(true);

      const result = await postService.getFeed(page, PAGE_LIMIT);

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
        error.response?.data?.message || "Failed to load home posts";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomePosts(1, true);
  }, []);

  const handlePostCreated = (newPost) => {
    if (!newPost) {
      return;
    }

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
    loadHomePosts(pagination.page + 1, false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-10">
        <section className="space-y-5 sm:space-y-6 lg:col-span-8">
          <StoryBar />

          <div className="flex items-center border-b border-[var(--color-border)]">
            <div className="border-b-2 border-[var(--color-primary)] px-1 pb-3 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-primary)] sm:text-sm">
              Following
            </div>
          </div>

          <CreatePostBox
            triggerOnly
            onPostCreated={handlePostCreated}
          />

          <PostList
            posts={posts}
            isLoading={isLoading}
            emptyMessage="No active posts match your home feed yet."
            pagination={pagination}
            onLoadMore={handleLoadMore}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        </section>

        <SuggestionsSidebar />
      </div>
    </div>
  );
}

export default HomePage;