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

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      className="group/avatar flex shrink-0 flex-col items-center gap-1.5 text-center transition-transform active:scale-95"
    >
      <div
        className={`relative rounded-full p-[2px] transition-all duration-300 group-hover/avatar:rotate-6 ${
          isCreateCard
            ? "bg-[var(--color-border-strong)]"
            : shouldShowUnviewedRing
              ? "bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600"
              : "bg-neutral-300 dark:bg-zinc-700"
        }`}
      >
        {/* This inner padding creates space between the ring and avatar */}
        <div className="rounded-full bg-[var(--color-surface)] p-[3px]">
          <div className="relative h-13 w-13 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
            {isCreateCard ? (
              <>
                {owner?.avatar ? (
                  <img
                    src={owner.avatar}
                    alt={owner?.name || "Your profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-black text-[var(--color-text-muted)]">
                    {avatarText}
                  </div>
                )}

                <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-follow)] text-sm font-bold leading-none text-white">
                  +
                </span>
              </>
            ) : owner?.avatar ? (
              <img
                src={owner.avatar}
                alt={owner?.name || "Story owner"}
                className="h-full w-full object-cover transition-all group-hover/avatar:brightness-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-black text-[var(--color-text-muted)]">
                {avatarText}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="max-w-[66px] truncate text-[10px] font-bold leading-tight text-[var(--color-text-muted)]">
        {isCreateCard
          ? "Your Story"
          : owner?.username
            ? `@${owner.username}`
            : owner?.name || "Story"}
      </p>
    </button>
  );
}

export default StoryCard;