import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import StoryCard from "./StoryCard.jsx";
import CreateStoryModal from "./CreateStoryModal.jsx";
import StoryViewerModal from "./StoryViewerModal.jsx";
import storyService from "../../services/storyService.js";
import useAuthStore from "../../store/authStore.js";

const STORY_STATUS_EVENT = "affinity-story-status-changed";

function StoryBar() {
  const currentUser = useAuthStore((state) => state.user);

  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const storiesRef = useRef([]);

  const sortedStories = useMemo(() => {
    const currentUserStories = stories.filter(
      (story) => story.user?._id === currentUser?._id
    );

    const otherStories = stories.filter(
      (story) => story.user?._id !== currentUser?._id
    );

    return [...currentUserStories, ...otherStories];
  }, [stories, currentUser?._id]);

  const storyGroups = useMemo(() => {
    const groupsByUser = new Map();

    sortedStories.forEach((story) => {
      const userId = story.user?._id || "unknown";
      const existingGroup = groupsByUser.get(userId);

      if (existingGroup) {
        existingGroup.stories.push(story);
        existingGroup.hasUnviewedStory =
          existingGroup.hasUnviewedStory || !story.isViewedByMe;
        return;
      }

      groupsByUser.set(userId, {
        userId,
        story,
        stories: [story],
        hasUnviewedStory: !story.isViewedByMe
      });
    });

    return Array.from(groupsByUser.values());
  }, [sortedStories]);

  const broadcastStoryStatuses = useCallback(
    (nextStories, previousStories = []) => {
      const ownerIds = new Set();

      [...previousStories, ...nextStories].forEach((story) => {
        if (story.user?._id) {
          ownerIds.add(story.user._id.toString());
        }
      });

      ownerIds.forEach((ownerId) => {
        const ownerStories = nextStories.filter(
          (story) => story.user?._id?.toString() === ownerId
        );

        const hasActiveStory = ownerStories.length > 0;

        const hasUnviewedStory = ownerStories.some(
          (story) => !story.isViewedByMe
        );

        window.dispatchEvent(
          new CustomEvent(STORY_STATUS_EVENT, {
            detail: {
              userId: ownerId,
              hasActiveStory,
              hasUnviewedStory
            }
          })
        );
      });
    },
    []
  );

  const applyStoriesUpdate = useCallback(
    (nextStories) => {
      const previousStories = storiesRef.current;

      storiesRef.current = nextStories;
      setStories(nextStories);

      broadcastStoryStatuses(nextStories, previousStories);
    },
    [broadcastStoryStatuses]
  );

  const loadStories = useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await storyService.getStoryFeed();

      const fetchedStories = result.data?.stories || [];

      applyStoriesUpdate(fetchedStories);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load stories";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyStoriesUpdate]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useEffect(() => {
    const handleRefreshStories = () => {
      loadStories();
    };

    window.addEventListener("affinity-refresh-stories", handleRefreshStories);

    return () => {
      window.removeEventListener("affinity-refresh-stories", handleRefreshStories);
    };
  }, [loadStories]);

  const handleOpenStory = (storyId) => {
    const index = sortedStories.findIndex((story) => story._id === storyId);

    if (index === -1) {
      return;
    }

    setSelectedIndex(index);
    setIsViewerOpen(true);
  };

  const handleOpenStoryGroup = (group) => {
    const firstUnviewedStory =
      group.stories.find((story) => !story.isViewedByMe) || group.story;

    handleOpenStory(firstUnviewedStory._id);
  };

  const handleStoryCreated = useCallback(
    (newStory) => {
      if (!newStory) {
        return;
      }

      const storyWithViewState = {
        ...newStory,
        isViewedByMe: false
      };

      const nextStories = [storyWithViewState, ...storiesRef.current];

      applyStoriesUpdate(nextStories);
    },
    [applyStoriesUpdate]
  );

  const handleStoryViewed = useCallback(
    (storyId) => {
      const nextStories = storiesRef.current.map((story) =>
        story._id === storyId
          ? {
              ...story,
              isViewedByMe: true
            }
          : story
      );

      applyStoriesUpdate(nextStories);
    },
    [applyStoriesUpdate]
  );

  const handleStoryDeleted = useCallback(
    (storyId) => {
      const nextStories = storiesRef.current.filter(
        (story) => story._id !== storyId
      );

      applyStoriesUpdate(nextStories);
    },
    [applyStoriesUpdate]
  );

  return (
    <>
      <section className="group/stories relative -mx-4 sm:mx-0">
        <button
          type="button"
          onClick={loadStories}
          disabled={isLoading}
          className="absolute -right-1 -top-2 z-10 hidden rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] opacity-0 transition group-hover/stories:opacity-100 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 sm:block"
        >
          Refresh
        </button>

        {isLoading && stories.length === 0 ? (
          <Loader text="Loading stories..." />
        ) : null}

        <div className="no-scrollbar flex select-none items-center gap-3 overflow-x-auto px-4 pb-2 scroll-smooth sm:mx-1 sm:gap-4 sm:px-0 sm:pb-3">
          <StoryCard
            isCreateCard
            currentUser={currentUser}
            onClick={() => setIsCreateOpen(true)}
          />

          {!isLoading && storyGroups.length === 0 ? (
            <div className="flex min-w-28 items-center px-2 py-3">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)]">
                No stories yet.
              </p>
            </div>
          ) : null}

          {storyGroups.map((group) => (
            <StoryCard
              key={group.userId}
              story={group.story}
              hasUnviewedStory={group.hasUnviewedStory}
              onClick={() => handleOpenStoryGroup(group)}
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