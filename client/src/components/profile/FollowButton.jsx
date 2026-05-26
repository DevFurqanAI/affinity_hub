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
      } else {
        const result = await followService.followUser(userId);

        toast.success(result.message || "User followed");

        onFollowChange?.({
          isFollowing: true,
          followersCount: result.data?.targetUserFollowersCount
        });
      }
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
          ? "border border-neutral-200 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          : "border border-[#0095f6] bg-[#0095f6] text-white hover:border-blue-600 hover:bg-blue-600"
      } ${className}`}
    >
      {isLoading ? "Please wait..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default FollowButton;