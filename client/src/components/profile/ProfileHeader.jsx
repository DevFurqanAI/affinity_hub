import FollowButton from "./FollowButton.jsx";
import StoryAvatar from "../stories/StoryAvatar.jsx";

function ProfileHeader({
  user,
  postsCount = 0,
  isOwnProfile,
  isFollowing,
  isBlockedByMe,
  onEditClick,
  onFollowChange,
  onBlockToggle,
  isBlockLoading,
  onFollowersClick,
  onFollowingClick
}) {
  const secondaryButtonClasses =
    "rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] active:scale-95";

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-7 sm:px-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-9">
        {/* Profile Story Avatar */}
        <StoryAvatar
          user={user}
          sizeClassName="h-24 w-24 sm:h-28 sm:w-28"
          textClassName="text-3xl"
        />

        {/* Identity Content */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <h1 className="truncate font-mono text-base font-black tracking-tight text-[var(--color-text)]">
              {user?.username}
            </h1>

            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEditClick}
                className={secondaryButtonClasses}
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {!isBlockedByMe ? (
                  <FollowButton
                    userId={user?._id}
                    isFollowing={isFollowing}
                    onFollowChange={onFollowChange}
                    size="sm"
                  />
                ) : null}

                <button
                  type="button"
                  onClick={onBlockToggle}
                  disabled={isBlockLoading}
                  className={`rounded-md border px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isBlockedByMe
                      ? "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
                      : "border-rose-500/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15"
                  }`}
                >
                  {isBlockLoading
                    ? "Please wait..."
                    : isBlockedByMe
                      ? "Unblock"
                      : "Block"}
                </button>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="mt-5 flex items-center justify-center gap-7 text-xs text-[var(--color-text-muted)] sm:justify-start">
            <div>
              <span className="mr-1 font-extrabold text-[var(--color-text)]">
                {postsCount}
              </span>
              posts
            </div>

            <button
              type="button"
              onClick={onFollowersClick}
              className="transition hover:text-rose-500"
            >
              <span className="mr-1 font-extrabold text-[var(--color-text)]">
                {user?.followersCount ?? 0}
              </span>
              followers
            </button>

            <button
              type="button"
              onClick={onFollowingClick}
              className="transition hover:text-rose-500"
            >
              <span className="mr-1 font-extrabold text-[var(--color-text)]">
                {user?.followingCount ?? 0}
              </span>
              following
            </button>
          </div>

          {/* Name and Bio */}
          <div className="mt-5">
            <p className="text-xs font-extrabold text-rose-500">
              {user?.name}
            </p>

            <p className="mt-1 max-w-md text-xs font-medium leading-relaxed text-[var(--color-text-muted)]">
              {user?.bio || "No bio added yet."}
            </p>
          </div>

          {/* Blocked Notice */}
          {isBlockedByMe ? (
            <div className="mt-5 max-w-xl rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-rose-500">
                User Blocked
              </p>

              <p className="mt-1 text-xs leading-5 text-rose-500/90">
                Their posts are hidden while this user remains blocked.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ProfileHeader;