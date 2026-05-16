import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import StoryCard from "./StoryCard.jsx";
import CreateStoryModal from "./CreateStoryModal.jsx";
import StoryViewerModal from "./StoryViewerModal.jsx";
import storyService from "../../services/storyService.js";
import useAuthStore from "../../store/authStore.js";

function StoryBar() {
  const currentUser = useAuthStore((state) => state.user);

  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sortedStories = useMemo(() => {
    const currentUserStories = stories.filter(
      (story) => story.user?._id === currentUser?._id
    );

    const otherStories = stories.filter(
      (story) => story.user?._id !== currentUser?._id
    );

    return [...currentUserStories, ...otherStories];
  }, [stories, currentUser?._id]);

  const loadStories = async () => {
    try {
      setIsLoading(true);

      const result = await storyService.getStoryFeed();

      setStories(result.data?.stories || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load stories";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleOpenStory = (storyId) => {
    const index = sortedStories.findIndex((story) => story._id === storyId);

    if (index === -1) {
      return;
    }

    setSelectedIndex(index);
    setIsViewerOpen(true);
  };

  const handleStoryCreated = (newStory) => {
    if (!newStory) {
      return;
    }

    setStories((previousStories) => [newStory, ...previousStories]);
  };

  const handleStoryViewed = (storyId) => {
    setStories((previousStories) =>
      previousStories.map((story) =>
        story._id === storyId
          ? {
              ...story,
              isViewedByMe: true
            }
          : story
      )
    );
  };

  const handleStoryDeleted = (storyId) => {
    setStories((previousStories) =>
      previousStories.filter((story) => story._id !== storyId)
    );
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Stories</h2>
            <p className="text-xs text-slate-500">
              Share moments that expire after 24 hours.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStories}
            className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Refresh
          </button>
        </div>

        {isLoading ? <Loader text="Loading stories..." /> : null}

        <div className="flex gap-3 overflow-x-auto pb-2">
          <StoryCard
            isCreateCard
            currentUser={currentUser}
            onClick={() => setIsCreateOpen(true)}
          />

          {!isLoading && sortedStories.length === 0 ? (
            <div className="flex min-w-52 items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                No stories yet. Create your first story.
              </p>
            </div>
          ) : null}

          {sortedStories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              onClick={() => handleOpenStory(story._id)}
            />
          ))}
        </div>
      </section>

      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStoryCreated={handleStoryCreated}
      />

      <StoryViewerModal
        stories={sortedStories}
        initialIndex={selectedIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onStoryDeleted={handleStoryDeleted}
        onStoryViewed={handleStoryViewed}
      />
    </>
  );
}

export default StoryBar;