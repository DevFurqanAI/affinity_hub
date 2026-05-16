import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../common/Button.jsx";
import followService from "../../services/followService.js";

function FollowButton({ userId, isFollowing, onFollowChange }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
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

  return (
    <Button
      type="button"
      variant={isFollowing ? "outline" : "primary"}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isLoading ? "Please wait..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

export default FollowButton;