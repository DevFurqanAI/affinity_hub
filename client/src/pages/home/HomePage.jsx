import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import PageContainer from "../../components/common/PageContainer.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import StoryBar from "../../components/stories/StoryBar.jsx";
import CreatePostBox from "../../components/posts/CreatePostBox.jsx";
import PostList from "../../components/posts/PostList.jsx";
import SuggestionsSidebar from "../../components/follow/SuggestionsSidebar.jsx";
import postService from "../../services/postService.js";

const PAGE_LIMIT = 10;

function HomePage() {
  const createPostRef = useRef(null);

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

  const scrollToCreatePost = () => {
    createPostRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };

  const emptyHomeState = (
    <Card>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
          🌱
        </div>

        <h2 className="mt-4 text-xl font-black text-slate-900">
          Your home feed is just getting started
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          Follow people, choose interests, explore posts, or create your first post
          to make your Home page feel alive.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/explore">
            <Button variant="outline" className="w-full">
              Explore Posts
            </Button>
          </Link>

          <Link to="/search">
            <Button variant="outline" className="w-full">
              Find People
            </Button>
          </Link>

          <Link to="/choose-interests">
            <Button variant="outline" className="w-full">
              Choose Interests
            </Button>
          </Link>

          <Button onClick={scrollToCreatePost} className="w-full">
            Create First Post
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <PageContainer
      title="Home"
      subtitle="Your main page for stories, posts, and people you follow."
      maxWidth="max-w-6xl"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <StoryBar />

          <div ref={createPostRef}>
            <CreatePostBox onPostCreated={handlePostCreated} />
          </div>

          {posts.length === 0 && !isLoading ? (
            emptyHomeState
          ) : (
            <PostList
              posts={posts}
              isLoading={isLoading}
              emptyMessage="Your home feed is just getting started."
              pagination={pagination}
              onLoadMore={handleLoadMore}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          )}
        </div>

        <div className="hidden xl:block">
          <SuggestionsSidebar />
        </div>
      </div>
    </PageContainer>
  );
}

export default HomePage;