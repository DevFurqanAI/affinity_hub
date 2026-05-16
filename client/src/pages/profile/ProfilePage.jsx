import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";
import ProfileHeader from "../../components/profile/ProfileHeader.jsx";
import EditProfileModal from "../../components/profile/EditProfileModal.jsx";
import FollowersModal from "../../components/profile/FollowersModal.jsx";
import FollowingModal from "../../components/profile/FollowingModal.jsx";
import userService from "../../services/userService.js";
import followService from "../../services/followService.js";
import blockService from "../../services/blockService.js";
import useAuthStore from "../../store/authStore.js";

function ProfilePage({ isMePage = false }) {
  const { username } = useParams();
  const navigate = useNavigate();

  const loggedInUser = useAuthStore((state) => state.user);

  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);

  const isOwnProfile =
    Boolean(loggedInUser?._id && profileUser?._id) &&
    loggedInUser._id === profileUser._id;

  const checkIfFollowing = async (targetUserId) => {
    if (!loggedInUser?._id || !targetUserId) {
      setIsFollowing(false);
      return;
    }

    if (loggedInUser._id === targetUserId) {
      setIsFollowing(false);
      return;
    }

    try {
      const result = await followService.getFollowing(loggedInUser._id);
      const followingList = result.data?.following || [];

      const found = followingList.some((user) => user._id === targetUserId);

      setIsFollowing(found);
    } catch {
      setIsFollowing(false);
    }
  };

  const checkIfBlockedByMe = async (targetUserId) => {
    if (!loggedInUser?._id || !targetUserId) {
      setIsBlockedByMe(false);
      return;
    }

    if (loggedInUser._id === targetUserId) {
      setIsBlockedByMe(false);
      return;
    }

    try {
      const result = await blockService.getBlockedUsers();
      const blockedUsers = result.data?.blockedUsers || [];

      const found = blockedUsers.some((user) => user._id === targetUserId);

      setIsBlockedByMe(found);
    } catch {
      setIsBlockedByMe(false);
    }
  };

  const loadProfile = async () => {
    try {
      setIsPageLoading(true);

      const result = isMePage
        ? await userService.getCurrentUserProfile()
        : await userService.getUserProfile(username);

      const user = result.data?.user;

      setProfileUser(user);

      await checkIfFollowing(user?._id);
      await checkIfBlockedByMe(user?._id);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load profile";

      toast.error(message);
      setProfileUser(null);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username, isMePage, loggedInUser?._id]);

  const handleFollowChange = ({ isFollowing: newFollowingState, followersCount }) => {
    setIsFollowing(newFollowingState);

    setProfileUser((previousUser) => ({
      ...previousUser,
      followersCount:
        followersCount !== undefined
          ? followersCount
          : newFollowingState
            ? (previousUser?.followersCount || 0) + 1
            : Math.max((previousUser?.followersCount || 0) - 1, 0)
    }));
  };

  const handleBlockToggle = async () => {
    if (!profileUser?._id) {
      return;
    }

    const confirmed = window.confirm(
      isBlockedByMe
        ? "Do you want to unblock this user?"
        : "Do you want to block this user? This will also remove follow relationships both ways."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsBlockLoading(true);

      if (isBlockedByMe) {
        const result = await blockService.unblockUser(profileUser._id);

        setIsBlockedByMe(false);

        toast.success(result.message || "User unblocked successfully");
      } else {
        const result = await blockService.blockUser(profileUser._id);

        setIsBlockedByMe(true);
        setIsFollowing(false);

        setProfileUser((previousUser) => ({
          ...previousUser,
          followersCount: Math.max((previousUser?.followersCount || 0) - 1, 0),
          followingCount: Math.max((previousUser?.followingCount || 0) - 1, 0)
        }));

        toast.success(result.message || "User blocked successfully");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Block action failed";

      toast.error(message);
    } finally {
      setIsBlockLoading(false);
    }
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      setIsSaving(true);

      const result = await userService.updateProfile(profileData);

      const updatedUser = result.data?.user;

      setProfileUser(updatedUser);

      toast.success(result.message || "Profile updated successfully");

      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile";

      toast.error(message);

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpdate = async (avatarFile) => {
    try {
      setIsSaving(true);

      const result = await userService.updateAvatar(avatarFile);

      const updatedUser = result.data?.user;

      setProfileUser(updatedUser);

      toast.success(result.message || "Avatar updated successfully");

      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update avatar";

      toast.error(message);

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewMyProfile = () => {
    if (loggedInUser?.username) {
      navigate(`/profile/${loggedInUser.username}`);
    } else {
      navigate("/");
    }
  };

  if (isPageLoading) {
    return <Loader text="Loading profile..." />;
  }

  if (!profileUser) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Profile Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The profile you are looking for does not exist.
          </p>

          <div className="mt-6">
            <Button onClick={handleViewMyProfile}>Go to My Profile</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <ProfileHeader
          user={profileUser}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isBlockedByMe={isBlockedByMe}
          onEditClick={() => setIsEditOpen(true)}
          onFollowChange={handleFollowChange}
          onBlockToggle={handleBlockToggle}
          isBlockLoading={isBlockLoading}
          onFollowersClick={() => setIsFollowersOpen(true)}
          onFollowingClick={() => setIsFollowingOpen(true)}
        />

        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Posts Coming Soon
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            User posts and activity will be added in a later module.
          </p>
        </section>
      </div>

      <EditProfileModal
        user={profileUser}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onProfileUpdate={handleProfileUpdate}
        onAvatarUpdate={handleAvatarUpdate}
        isLoading={isSaving}
      />

      <FollowersModal
        userId={profileUser._id}
        isOpen={isFollowersOpen}
        onClose={() => setIsFollowersOpen(false)}
      />

      <FollowingModal
        userId={profileUser._id}
        isOpen={isFollowingOpen}
        onClose={() => setIsFollowingOpen(false)}
      />
    </>
  );
}

export default ProfilePage;