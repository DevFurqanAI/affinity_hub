import mongoose from "mongoose";

import User from "../models/User.model.js";
import Block from "../models/Block.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";

const safeUserSelect =
  "name username email bio avatar role status isVerified followersCount followingCount createdAt updatedAt";

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getBlockedUserIdsForCurrentUser = async (userId) => {
  const blocks = await Block.find({
    $or: [
      {
        blocker: userId
      },
      {
        blocked: userId
      }
    ]
  }).select("blocker blocked");

  return blocks.map((block) =>
    block.blocker.toString() === userId.toString()
      ? block.blocked
      : block.blocker
  );
};

const checkBlockBetweenUsers = async (userA, userB) => {
  return await Block.findOne({
    $or: [
      {
        blocker: userA,
        blocked: userB
      },
      {
        blocker: userB,
        blocked: userA
      }
    ]
  });
};

/*
|--------------------------------------------------------------------------
| POST /api/follows/:userId/follow
|--------------------------------------------------------------------------
*/
export const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  if (!isValidMongoId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (currentUserId.toString() === userId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const blockedRelation = await checkBlockBetweenUsers(currentUserId, userId);

  if (blockedRelation) {
    throw new ApiError(403, "You cannot follow this user");
  }

  const userToFollow = await User.findById(userId);

  if (!userToFollow) {
    throw new ApiError(404, "User not found");
  }

  if (userToFollow.status !== "active") {
    throw new ApiError(403, "You cannot follow this user");
  }

  const currentUser = await User.findById(currentUserId);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  const alreadyFollowing = currentUser.following.some(
    (followingId) => followingId.toString() === userId
  );

  if (alreadyFollowing) {
    throw new ApiError(409, "You are already following this user");
  }

  currentUser.following.push(userToFollow._id);
  currentUser.followingCount = currentUser.following.length;

  userToFollow.followers.push(currentUser._id);
  userToFollow.followersCount = userToFollow.followers.length;

  await currentUser.save({ validateBeforeSave: false });
  await userToFollow.save({ validateBeforeSave: false });

  await createNotification({
    receiver: userToFollow._id,
    sender: currentUser._id,
    type: "follow",
    referenceId: currentUser._id,
    message: `${currentUser.name} started following you`
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        followingUserId: userToFollow._id,
        currentUserFollowingCount: currentUser.followingCount,
        targetUserFollowersCount: userToFollow.followersCount
      },
      "User followed successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/follows/:userId/unfollow
|--------------------------------------------------------------------------
*/
export const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  if (!isValidMongoId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (currentUserId.toString() === userId) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }

  const userToUnfollow = await User.findById(userId);

  if (!userToUnfollow) {
    throw new ApiError(404, "User not found");
  }

  const currentUser = await User.findById(currentUserId);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  const isFollowing = currentUser.following.some(
    (followingId) => followingId.toString() === userId
  );

  if (!isFollowing) {
    throw new ApiError(409, "You are not following this user");
  }

  currentUser.following = currentUser.following.filter(
    (followingId) => followingId.toString() !== userId
  );

  userToUnfollow.followers = userToUnfollow.followers.filter(
    (followerId) => followerId.toString() !== currentUserId.toString()
  );

  currentUser.followingCount = currentUser.following.length;
  userToUnfollow.followersCount = userToUnfollow.followers.length;

  await currentUser.save({ validateBeforeSave: false });
  await userToUnfollow.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        unfollowedUserId: userToUnfollow._id,
        currentUserFollowingCount: currentUser.followingCount,
        targetUserFollowersCount: userToUnfollow.followersCount
      },
      "User unfollowed successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/follows/suggestions
|--------------------------------------------------------------------------
*/
export const getFollowSuggestions = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select("following");

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  const blockedUserIds = await getBlockedUserIdsForCurrentUser(req.user._id);

  const excludedUserIds = [
    req.user._id,
    ...currentUser.following,
    ...blockedUserIds
  ];

  const suggestions = await User.find({
    _id: {
      $nin: excludedUserIds
    },
    status: "active"
  })
    .select(safeUserSelect)
    .sort({ createdAt: -1 })
    .limit(10);

  return res.status(200).json(
    new ApiResponse(
      200,
      { suggestions },
      "Follow suggestions fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/follows/:userId/followers
|--------------------------------------------------------------------------
*/
export const getUserFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidMongoId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const blockedUserIds = await getBlockedUserIdsForCurrentUser(req.user._id);

  const user = await User.findById(userId).populate({
    path: "followers",
    match: {
      _id: {
        $nin: blockedUserIds
      }
    },
    select: safeUserSelect
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        followers: user.followers,
        followersCount: user.followers.length
      },
      "Followers fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/follows/:userId/following
|--------------------------------------------------------------------------
*/
export const getUserFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidMongoId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const blockedUserIds = await getBlockedUserIdsForCurrentUser(req.user._id);

  const user = await User.findById(userId).populate({
    path: "following",
    match: {
      _id: {
        $nin: blockedUserIds
      }
    },
    select: safeUserSelect
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        following: user.following,
        followingCount: user.following.length
      },
      "Following fetched successfully"
    )
  );
});