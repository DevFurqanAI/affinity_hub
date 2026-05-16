import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import storyService from "../../services/storyService.js";
import useAuthStore from "../../store/authStore.js";

const STORY_DURATION_MS = 6000;

function StoryViewerModal({
  stories,
  initialIndex = 0,
  isOpen,
  onClose,
  onStoryDeleted,
  onStoryViewed
}) {
  const loggedInUser = useAuthStore((state) => state.user);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewsOpen, setIsViewsOpen] = useState(false);
  const [views, setViews] = useState([]);
  const [isViewsLoading, setIsViewsLoading] = useState(false);

  const currentStory = stories?.[currentIndex];

  const isOwner =
    Boolean(loggedInUser?._id && currentStory?.user?._id) &&
    loggedInUser._id === currentStory.user._id;

  const owner = currentStory?.user;

  const avatarText = owner?.name?.charAt(0)?.toUpperCase() || "A";

  const totalStories = stories?.length || 0;

  const progressBars = useMemo(() => {
    return Array.from({ length: totalStories }, (_, index) => index);
  }, [totalStories]);

  const goNext = () => {
    if (currentIndex < totalStories - 1) {
      setCurrentIndex((previousIndex) => previousIndex + 1);
      setProgress(0);
      setIsViewsOpen(false);
      return;
    }

    onClose();
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((previousIndex) => previousIndex - 1);
      setProgress(0);
      setIsViewsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsViewsOpen(false);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const markViewed = async () => {
      if (!currentStory?._id) {
        return;
      }

      try {
        await storyService.viewStory(currentStory._id);
        onStoryViewed?.(currentStory._id);
      } catch {
        // Viewing should not break the story modal.
      }
    };

    if (isOpen && currentStory?._id) {
      markViewed();
    }
  }, [isOpen, currentStory?._id]);

  useEffect(() => {
    if (!isOpen || !currentStory || isViewsOpen) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((previousProgress) => {
        const nextProgress = previousProgress + 100 / (STORY_DURATION_MS / 100);

        if (nextProgress >= 100) {
          clearInterval(interval);
          goNext();
          return 100;
        }

        return nextProgress;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, currentStory?._id, currentIndex, isViewsOpen]);

  if (!isOpen || !currentStory) {
    return null;
  }

  const handleDeleteStory = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this story?");

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      const result = await storyService.deleteStory(currentStory._id);

      toast.success(result.message || "Story deleted successfully");

      onStoryDeleted?.(currentStory._id);

      if (totalStories <= 1) {
        onClose();
      } else if (currentIndex >= totalStories - 1) {
        setCurrentIndex((previousIndex) => Math.max(previousIndex - 1, 0));
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete story";

      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoadViews = async () => {
    try {
      setIsViewsOpen(true);
      setIsViewsLoading(true);

      const result = await storyService.getStoryViews(currentStory._id);

      setViews(result.data?.views || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load story views";

      toast.error(message);
      setIsViewsOpen(false);
    } finally {
      setIsViewsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-3 py-5">
      <div className="relative flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute left-0 right-0 top-0 z-20 p-4">
          <div className="flex gap-1">
            {progressBars.map((barIndex) => (
              <div
                key={barIndex}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
              >
                <div
                  className="h-full bg-white transition-all"
                  style={{
                    width:
                      barIndex < currentIndex
                        ? "100%"
                        : barIndex === currentIndex
                          ? `${progress}%`
                          : "0%"
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                {owner?.avatar ? (
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {owner?.name}
                </p>
                <p className="truncate text-xs text-white/70">
                  @{owner?.username}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 px-3 py-1 text-xl font-bold text-white transition hover:bg-white/20"
            >
              ×
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={goPrevious}
          className="absolute left-0 top-0 z-10 h-full w-1/3"
          aria-label="Previous story"
        />

        <button
          type="button"
          onClick={goNext}
          className="absolute right-0 top-0 z-10 h-full w-1/3"
          aria-label="Next story"
        />

        <div className="flex h-full items-center justify-center bg-black">
          {currentStory.mediaType === "image" ? (
            <img
              src={currentStory.media?.url}
              alt={currentStory.caption || "Story"}
              className="max-h-full w-full object-contain"
            />
          ) : (
            <video
              src={currentStory.media?.url}
              controls
              autoPlay
              className="max-h-full w-full"
            />
          )}
        </div>

        {currentStory.caption ? (
          <div className="absolute bottom-20 left-4 right-4 z-20 rounded-2xl bg-slate-950/60 p-3 text-sm leading-6 text-white backdrop-blur">
            {currentStory.caption}
          </div>
        ) : null}

        {isOwner ? (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 bg-white/90"
              onClick={handleLoadViews}
              disabled={isDeleting}
            >
              Viewers
            </Button>

            <Button
              size="sm"
              variant="danger"
              className="flex-1"
              onClick={handleDeleteStory}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        ) : null}

        {isViewsOpen ? (
          <div className="absolute bottom-0 left-0 right-0 z-30 max-h-[55%] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Story Viewers
                </h3>
                <p className="text-xs text-slate-500">
                  People who viewed this story.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsViewsOpen(false)}
                className="rounded-full px-3 py-1 text-xl font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {isViewsLoading ? <Loader text="Loading viewers..." /> : null}

              {!isViewsLoading && views.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  No views yet.
                </p>
              ) : null}

              {!isViewsLoading
                ? views.map((view) => {
                    const viewer = view.viewer;
                    const viewerAvatarText =
                      viewer?.name?.charAt(0)?.toUpperCase() || "A";

                    return (
                      <div
                        key={view._id}
                        className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                          {viewer?.avatar ? (
                            <img
                              src={viewer.avatar}
                              alt={viewer.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            viewerAvatarText
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {viewer?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            @{viewer?.username}
                          </p>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default StoryViewerModal;