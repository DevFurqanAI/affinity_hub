import { useState } from "react";
import toast from "react-hot-toast";

import followService from "../../services/followService.js";

function FollowButton({
  userId,
  isFollowing,
  onFollowChange,
  className = "",
  size = "md"
}) {
  const [isLoading, setIsLoading] = useState(false);

  const refreshStoryFeed = () => {
    window.dispatchEvent(new Event("affinity-refresh-stories"));
  };

  const handleFollowToggle = async () => {
    if (!userId || isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      if (isFollowing) {
        const result = await followService.unfollowUser(userId);

        toast.success(result.message || "User unfollowed");

        onFollowChange?.({
          isFollowing: false,
          followersCount: result.data?.targetUserFollowersCount
        });

        refreshStoryFeed();
        return;
      }

      const result = await followService.followUser(userId);

      toast.success(result.message || "User followed");

      onFollowChange?.({
        isFollowing: true,
        followersCount: result.data?.targetUserFollowersCount
      });

      refreshStoryFeed();
    } catch (error) {
      const message =
        error.response?.data?.message || "Follow action failed";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-[11px]"
      : size === "lg"
        ? "px-5 py-3 text-sm"
        : "px-4 py-2 text-[11px]";

  return (
    <button
      type="button"
      onClick={handleFollowToggle}
      disabled={isLoading || !userId}
      className={`rounded-lg font-extrabold uppercase tracking-wide transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses} ${
        isFollowing
          ? "border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
          : "border border-[#0095f6] bg-[#0095f6] text-white hover:border-blue-600 hover:bg-blue-600"
      } ${className}`}
    >
      {isLoading ? "Please wait..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default FollowButton;