import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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

  const currentStoryId = currentStory?._id;

  const isOwner =
    Boolean(loggedInUser?._id && currentStory?.user?._id) &&
    loggedInUser._id === currentStory.user._id;

  const owner = currentStory?.user;

  const avatarText = owner?.name?.charAt(0)?.toUpperCase() || "A";

  const totalStories = stories?.length || 0;

  const progressBars = useMemo(() => {
    return Array.from({ length: totalStories }, (_, index) => index);
  }, [totalStories]);

  const goNext = useCallback(() => {
    if (currentIndex < totalStories - 1) {
      setCurrentIndex((previousIndex) => previousIndex + 1);
      setProgress(0);
      setIsViewsOpen(false);
      return;
    }

    onClose();
  }, [currentIndex, totalStories, onClose]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((previousIndex) => previousIndex - 1);
      setProgress(0);
      setIsViewsOpen(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsViewsOpen(false);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const markViewed = async () => {
      if (!currentStoryId) {
        return;
      }

      try {
        await storyService.viewStory(currentStoryId);
        onStoryViewed?.(currentStoryId);
      } catch {
        // Viewing should not break the story modal.
      }
    };

    if (isOpen && currentStoryId) {
      markViewed();
    }
  }, [isOpen, currentStoryId, onStoryViewed]);

  useEffect(() => {
    if (!isOpen || !currentStoryId || isViewsOpen) {
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
  }, [isOpen, currentStoryId, isViewsOpen, goNext]);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-2 backdrop-blur-sm sm:p-5">
      <div className="relative flex h-[calc(100dvh-1rem)] w-full max-w-md flex-col overflow-hidden rounded-[26px] bg-black shadow-2xl sm:h-[90vh] sm:rounded-3xl">
        {/* Progress and Story Owner Header */}
        <div className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/85 via-black/45 to-transparent px-4 pb-8 pt-4">
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-zinc-800 text-sm font-bold text-white">
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

                <p className="truncate text-xs text-white/65">
                  @{owner?.username}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close story viewer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-medium leading-none text-white transition hover:bg-white/20"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tap Areas */}
        <button
          type="button"
          onClick={goPrevious}
          className="absolute bottom-20 left-0 top-20 z-10 w-1/3"
          aria-label="Previous story"
        />

        <button
          type="button"
          onClick={goNext}
          className="absolute bottom-20 right-0 top-20 z-10 w-1/3"
          aria-label="Next story"
        />

        {/* Story Media */}
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
              playsInline
              className="max-h-full w-full object-contain"
            />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption ? (
          <div
            className={`absolute left-4 right-4 z-20 rounded-2xl bg-black/65 p-3 text-sm leading-6 text-white backdrop-blur ${
              isOwner ? "bottom-24" : "bottom-4"
            }`}
          >
            {currentStory.caption}
          </div>
        ) : null}

        {/* Owner Story Actions */}
        {isOwner ? (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent px-4 pb-4 pt-10">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLoadViews}
                disabled={isDeleting}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/95 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Viewers
              </button>

              <button
                type="button"
                onClick={handleDeleteStory}
                disabled={isDeleting}
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-rose-600 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ) : null}

        {/* Story Viewers Bottom Sheet */}
        {isViewsOpen ? (
          <>
            <button
              type="button"
              aria-label="Close viewers panel"
              onClick={() => setIsViewsOpen(false)}
              className="absolute inset-0 z-30 bg-black/55"
            />

            <div className="absolute bottom-0 left-0 right-0 z-40 max-h-[60%] overflow-y-auto rounded-t-3xl border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border-strong)]" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text)]">
                    Story Viewers
                  </h3>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    People who viewed this story.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsViewsOpen(false)}
                  aria-label="Close story viewers"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {isViewsLoading ? <Loader text="Loading viewers..." /> : null}

                {!isViewsLoading && views.length === 0 ? (
                  <p className="rounded-2xl bg-[var(--color-surface-muted)] p-5 text-center text-sm text-[var(--color-text-muted)]">
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
                          className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface-muted)] p-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-soft)] text-sm font-bold text-[var(--color-primary)]">
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

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[var(--color-text)]">
                              {viewer?.name}
                            </p>

                            <p className="truncate text-xs text-[var(--color-text-muted)]">
                              @{viewer?.username}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default StoryViewerModal;
