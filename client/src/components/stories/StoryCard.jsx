function StoryCard({ story, isCreateCard = false, onClick, currentUser }) {
  const owner = story?.user || currentUser;
  const avatarText = owner?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-24 shrink-0 text-left"
    >
      <div
        className={`relative h-36 overflow-hidden rounded-3xl border-2 shadow-sm transition group-hover:scale-[1.02] ${
          isCreateCard
            ? "border-dashed border-slate-300 bg-slate-100"
            : story?.isViewedByMe
              ? "border-slate-200 bg-slate-100"
              : "border-slate-900 bg-slate-200"
        }`}
      >
        {isCreateCard ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
              +
            </div>
            <p className="px-2 text-center text-xs font-semibold text-slate-700">
              Add Story
            </p>
          </div>
        ) : (
          <>
            {story?.mediaType === "image" ? (
              <img
                src={story.media?.url}
                alt={story.caption || "Story"}
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                src={story?.media?.url}
                className="h-full w-full object-cover"
                muted
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

            <div className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-700">
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

            <p className="absolute bottom-2 left-2 right-2 line-clamp-2 text-xs font-bold text-white">
              {owner?.username ? `@${owner.username}` : "Story"}
            </p>
          </>
        )}
      </div>
    </button>
  );
}

export default StoryCard;