import mongoose from "mongoose";

import Block from "../models/Block.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const safeUserSelect =
  "name username bio avatar role status followersCount followingCount createdAt updatedAt";

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const refreshFollowCounts = (user) => {
  user.followersCount = user.followers.length;
  user.followingCount = user.following.length;
};

/*
|--------------------------------------------------------------------------
| POST /api/blocks/:userId
|--------------------------------------------------------------------------
| Block a user.
| Blocking also removes follow relationship both ways.
*/
export const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  if (!isValidMongoId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (currentUserId.toString() === userId) {
    throw new ApiError(400, "You cannot block yourself");
  }

  const userToBlock = await User.findById(userId);

  if (!userToBlock) {
    throw new ApiError(404, "User not found");
  }

  const existingBlock = await Block.findOne({
    blocker: currentUserId,
    blocked: userId
  });

  if (existingBlock) {
    throw new ApiError(409, "You have already blocked this user");
  }

  const currentUser = await User.findById(currentUserId);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  await Block.create({
    blocker: currentUserId,
    blocked: userId
  });

  /*
  |--------------------------------------------------------------------------
  | Remove follow relationship both ways
  |--------------------------------------------------------------------------
  | If current user follows blocked user, remove it.
  | If blocked user follows current user, remove it.
  */
  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== userId
  );

  currentUser.followers = currentUser.followers.filter(
    (id) => id.toString() !== userId
  );

  userToBlock.following = userToBlock.following.filter(
    (id) => id.toString() !== currentUserId.toString()
  );

  userToBlock.followers = userToBlock.followers.filter(
    (id) => id.toString() !== currentUserId.toString()
  );

  refreshFollowCounts(currentUser);
  refreshFollowCounts(userToBlock);

  await currentUser.save({ validateBeforeSave: false });
  await userToBlock.save({ validateBeforeSave: false });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        blockedUserId: userId
      },
      "User blocked successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/blocks/:userId
|--------------------------------------------------------------------------
| Unblock a user.
*/
export const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  if (!isValidMongoId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (currentUserId.toString() === userId) {
    throw new ApiError(400, "You cannot unblock yourself");
  }

  const block = await Block.findOne({
    blocker: currentUserId,
    blocked: userId
  });

  if (!block) {
    throw new ApiError(404, "Blocked user not found");
  }

  await Block.findByIdAndDelete(block._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        unblockedUserId: userId
      },
      "User unblocked successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/blocks
|--------------------------------------------------------------------------
| Get users blocked by logged-in user.
*/
export const getMyBlockedUsers = asyncHandler(async (req, res) => {
  const blocks = await Block.find({
    blocker: req.user._id
  })
    .populate({
      path: "blocked",
      select: safeUserSelect
    })
    .sort({ createdAt: -1 });

  const blockedUsers = blocks
    .filter((block) => block.blocked)
    .map((block) => block.blocked);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        blockedUsers
      },
      "Blocked users fetched successfully"
    )
  );
});