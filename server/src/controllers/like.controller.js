import mongoose from "mongoose";

import Like from "../models/Like.model.js";
import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/*
|--------------------------------------------------------------------------
| POST /api/likes/:postId
|--------------------------------------------------------------------------
| Like a post.
*/
export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  if (!isValidMongoId(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const alreadyLiked = await Like.findOne({
    post: postId,
    user: userId
  });

  if (alreadyLiked) {
    throw new ApiError(409, "You have already liked this post");
  }

  await Like.create({
    post: postId,
    user: userId
  });

  post.likesCount += 1;
  await post.save({ validateBeforeSave: false });

  const sender = await User.findById(userId).select("name");

  await createNotification({
    receiver: post.author,
    sender: userId,
    type: "like",
    post: post._id,
    referenceId: post._id,
    message: `${sender?.name || "Someone"} liked your post`
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        postId,
        isLikedByMe: true,
        likesCount: post.likesCount
      },
      "Post liked successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/likes/:postId
|--------------------------------------------------------------------------
| Unlike a post.
*/
export const unlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  if (!isValidMongoId(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = await Like.findOne({
    post: postId,
    user: userId
  });

  if (!existingLike) {
    throw new ApiError(409, "You have not liked this post yet");
  }

  await Like.findByIdAndDelete(existingLike._id);

  post.likesCount = Math.max(post.likesCount - 1, 0);
  await post.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        postId,
        isLikedByMe: false,
        likesCount: post.likesCount
      },
      "Post unliked successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/likes/:postId/status
|--------------------------------------------------------------------------
| Check if logged-in user liked a post.
*/
export const getLikeStatus = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  if (!isValidMongoId(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  }).select("_id likesCount");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = await Like.findOne({
    post: postId,
    user: userId
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        postId,
        isLikedByMe: Boolean(existingLike),
        likesCount: post.likesCount
      },
      "Like status fetched successfully"
    )
  );
});