import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../../components/common/Loader.jsx";
import Button from "../../components/common/Button.jsx";
import ProfileHeader from "../../components/profile/ProfileHeader.jsx";
import EditProfileModal from "../../components/profile/EditProfileModal.jsx";
import FollowersModal from "../../components/profile/FollowersModal.jsx";
import FollowingModal from "../../components/profile/FollowingModal.jsx";
import PostList from "../../components/posts/PostList.jsx";
import userService from "../../services/userService.js";
import followService from "../../services/followService.js";
import blockService from "../../services/blockService.js";
import postService from "../../services/postService.js";
import useAuthStore from "../../store/authStore.js";

const PAGE_LIMIT = 10;

function ProfilePage({ isMePage = false }) {
  const { username } = useParams();
  const navigate = useNavigate();

  const loggedInUser = useAuthStore((state) => state.user);

  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalPosts: 0
  });

  const isOwnProfile =
    Boolean(loggedInUser?._id && profileUser?._id) &&
    loggedInUser._id === profileUser._id;

  const checkIfFollowing = async (targetUserId) => {
    if (!loggedInUser?._id || !targetUserId || loggedInUser._id === targetUserId) {
      setIsFollowing(false);
      return;
    }

    try {
      const result = await followService.getFollowing(loggedInUser._id);
      const followingList = result.data?.following || [];

      setIsFollowing(followingList.some((user) => user._id === targetUserId));
    } catch {
      setIsFollowing(false);
    }
  };

  const checkIfBlockedByMe = async (targetUserId) => {
    if (!loggedInUser?._id || !targetUserId || loggedInUser._id === targetUserId) {
      setIsBlockedByMe(false);
      return;
    }

    try {
      const result = await blockService.getBlockedUsers();
      const blockedUsers = result.data?.blockedUsers || [];

      setIsBlockedByMe(blockedUsers.some((user) => user._id === targetUserId));
    } catch {
      setIsBlockedByMe(false);
    }
  };

  const loadUserPosts = async (
    profileUsername,
    page = 1,
    shouldReplace = true
  ) => {
    if (!profileUsername) {
      return;
    }

    try {
      setIsPostsLoading(true);

      const result = await postService.getUserPosts(
        profileUsername,
        page,
        PAGE_LIMIT
      );

      const newPosts = result.data?.posts || [];
      const newPagination = result.data?.pagination || {
        page,
        limit: PAGE_LIMIT,
        totalPages: 1,
        totalPosts: newPosts.length
      };

      setPosts((previousPosts) =>
        shouldReplace ? newPosts : [...previousPosts, ...newPosts]
      );

      setPagination(newPagination);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load profile posts";

      toast.error(message);

      setPosts([]);
      setPagination({
        page: 1,
        limit: PAGE_LIMIT,
        totalPages: 1,
        totalPosts: 0
      });
    } finally {
      setIsPostsLoading(false);
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

      await loadUserPosts(user?.username, 1, true);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load profile";

      toast.error(message);
      setProfileUser(null);
      setPosts([]);
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

        await loadUserPosts(profileUser.username, 1, true);
      } else {
        const result = await blockService.blockUser(profileUser._id);

        setIsBlockedByMe(true);
        setIsFollowing(false);
        setPosts([]);

        setPagination({
          page: 1,
          limit: PAGE_LIMIT,
          totalPages: 1,
          totalPosts: 0
        });

        setProfileUser((previousUser) => ({
          ...previousUser,
          followersCount: Math.max((previousUser?.followersCount || 0) - 1, 0),
          followingCount: Math.max((previousUser?.followingCount || 0) - 1, 0)
        }));

        toast.success(result.message || "User blocked successfully");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Block action failed";
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

      await loadUserPosts(updatedUser?.username, 1, true);

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

  const handlePostUpdated = (updatedPost) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handlePostDeleted = (postId) => {
    setPosts((previousPosts) =>
      previousPosts.filter((post) => post._id !== postId)
    );

    setPagination((previousPagination) => ({
      ...previousPagination,
      totalPosts: Math.max((previousPagination.totalPosts || 0) - 1, 0)
    }));
  };

  const handleLoadMorePosts = () => {
    loadUserPosts(profileUser?.username, pagination.page + 1, false);
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

        {!isBlockedByMe || isOwnProfile ? (
          <PostList
            posts={posts}
            isLoading={isPostsLoading}
            emptyMessage={
              isOwnProfile
                ? "You have not created any posts yet."
                : "This user has no public posts yet."
            }
            pagination={pagination}
            onLoadMore={handleLoadMorePosts}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        ) : null}
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