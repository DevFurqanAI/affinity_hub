import Button from "../common/Button.jsx";
import FollowButton from "./FollowButton.jsx";

function ProfileHeader({
  user,
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
  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-32 bg-linear-to-r from-slate-900 via-slate-800 to-slate-600" />

      <div className="px-5 pb-6 sm:px-8">
        <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-slate-200 text-4xl font-bold text-slate-700 shadow-sm">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarText
              )}
            </div>

            <div className="pb-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {user?.name}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                @{user?.username}
              </p>
            </div>
          </div>

          {isOwnProfile ? (
            <Button onClick={onEditClick} variant="outline">
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              {!isBlockedByMe ? (
                <FollowButton
                  userId={user?._id}
                  isFollowing={isFollowing}
                  onFollowChange={onFollowChange}
                />
              ) : null}

              <Button
                type="button"
                variant={isBlockedByMe ? "outline" : "danger"}
                onClick={onBlockToggle}
                disabled={isBlockLoading}
              >
                {isBlockLoading
                  ? "Please wait..."
                  : isBlockedByMe
                    ? "Unblock"
                    : "Block"}
              </Button>
            </div>
          )}
        </div>

        {isBlockedByMe ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              You blocked this user.
            </p>
            <p className="mt-1 text-xs text-red-600">
              Their posts will not appear in your feed, search, suggestions, or
              recommendations where filtering is applied.
            </p>
          </div>
        ) : null}

        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
          {user?.bio || "No bio added yet."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
          <button
            type="button"
            onClick={onFollowersClick}
            className="rounded-2xl bg-slate-50 p-4 text-center transition hover:bg-slate-100"
          >
            <p className="text-xl font-bold text-slate-900">
              {user?.followersCount || 0}
            </p>
            <p className="text-sm text-slate-500">Followers</p>
          </button>

          <button
            type="button"
            onClick={onFollowingClick}
            className="rounded-2xl bg-slate-50 p-4 text-center transition hover:bg-slate-100"
          >
            <p className="text-xl font-bold text-slate-900">
              {user?.followingCount || 0}
            </p>
            <p className="text-sm text-slate-500">Following</p>
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProfileHeader;