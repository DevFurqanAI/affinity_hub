function StoryCard({
  story,
  isCreateCard = false,
  onClick,
  currentUser,
  hasUnviewedStory
}) {
  const owner = story?.user || currentUser;
  const avatarText = owner?.name?.charAt(0)?.toUpperCase() || "A";

  const shouldShowUnviewedRing =
    typeof hasUnviewedStory === "boolean"
      ? hasUnviewedStory
      : !story?.isViewedByMe;

  const accessibleLabel = isCreateCard
    ? "Create your story"
    : `View ${owner?.username || owner?.name || "user"}'s story`;

  if (isCreateCard) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={accessibleLabel}
        title={accessibleLabel}
        className="group/avatar flex shrink-0 flex-col items-center gap-1 text-center transition-transform active:scale-95 sm:gap-1.5"
      >
        <div className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full sm:h-[68px] sm:w-[68px]">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]">
            {owner?.avatar ? (
              <img
                src={owner.avatar}
                alt={owner?.name || "Your profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-black text-[var(--color-text-muted)]">
                {avatarText}
              </span>
            )}
          </div>

          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-follow)] text-sm font-black leading-none text-white shadow-md">
            +
          </span>
        </div>

        <p className="max-w-[58px] truncate text-[10px] font-bold leading-tight text-[var(--color-text-muted)] sm:max-w-[66px]">
          Your Story
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      className="group/avatar flex shrink-0 flex-col items-center gap-1 text-center transition-transform active:scale-95 sm:gap-1.5"
    >
      <div
        className={`relative rounded-full p-[2px] transition-all duration-300 group-hover/avatar:rotate-6 ${
          shouldShowUnviewedRing
            ? "bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600"
            : "bg-[var(--color-border-strong)]"
        }`}
      >
        <div className="rounded-full bg-[var(--color-surface)] p-[2.5px] sm:p-[3px]">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-muted)] sm:h-13 sm:w-13">
            {owner?.avatar ? (
              <img
                src={owner.avatar}
                alt={owner?.name || "Story owner"}
                className="h-full w-full object-cover transition-all group-hover/avatar:brightness-110"
              />
            ) : (
              <span className="text-xs font-black text-[var(--color-text-muted)]">
                {avatarText}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="max-w-[58px] truncate text-[10px] font-bold leading-tight text-[var(--color-text-muted)] sm:max-w-[66px]">
        {owner?.username ? `@${owner.username}` : owner?.name || "Story"}
      </p>
    </button>
  );
}

export default StoryCard;