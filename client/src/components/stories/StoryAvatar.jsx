import { useEffect, useState } from "react";

const STORY_STATUS_EVENT = "affinity-story-status-changed";

function StoryAvatar({
  user,
  sizeClassName = "h-10 w-10",
  textClassName = "text-xs",
  className = "",
  showStoryRing = false
}) {
  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  const [storyStatus, setStoryStatus] = useState({
    hasActiveStory: Boolean(user?.hasActiveStory),
    hasUnviewedStory: Boolean(user?.hasUnviewedStory)
  });

  useEffect(() => {
    setStoryStatus({
      hasActiveStory: Boolean(user?.hasActiveStory),
      hasUnviewedStory: Boolean(user?.hasUnviewedStory)
    });
  }, [user?._id, user?.hasActiveStory, user?.hasUnviewedStory]);

  useEffect(() => {
    if (!showStoryRing) {
      return undefined;
    }

    const handleStoryStatusChanged = (event) => {
      const changedUserId = event.detail?.userId;

      if (!changedUserId || changedUserId !== user?._id?.toString()) {
        return;
      }

      setStoryStatus({
        hasActiveStory: Boolean(event.detail?.hasActiveStory),
        hasUnviewedStory: Boolean(event.detail?.hasUnviewedStory)
      });
    };

    window.addEventListener(STORY_STATUS_EVENT, handleStoryStatusChanged);

    return () => {
      window.removeEventListener(STORY_STATUS_EVENT, handleStoryStatusChanged);
    };
  }, [user?._id, showStoryRing]);

  const avatar = (
    <span
      className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] font-black text-[var(--color-text)] ${textClassName}`}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user?.name || "Profile"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        avatarText
      )}
    </span>
  );

  if (!showStoryRing || !storyStatus.hasActiveStory) {
    return (
      <span
        className={`inline-flex shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] ${sizeClassName} ${className}`}
      >
        {avatar}
      </span>
    );
  }

  const ringClasses = storyStatus.hasUnviewedStory
    ? "bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600"
    : "bg-[var(--color-border-strong)]";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full p-[2px] ${ringClasses} ${className}`}
    >
      <span className="inline-flex rounded-full bg-[var(--color-surface)] p-[3px]">
        <span className={`inline-flex overflow-hidden rounded-full ${sizeClassName}`}>
          {avatar}
        </span>
      </span>
    </span>
  );
}

export default StoryAvatar;