import Like from "../models/Like.model.js";
import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";
import canViewPost from "../utils/canViewPost.js";

export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const { post } = await canViewPost(postId, userId);

  const alreadyLiked = await Like.findOne({
    post: post._id,
    user: userId
  });

  if (alreadyLiked) {
    throw new ApiError(409, "You have already liked this post");
  }

  await Like.create({
    post: post._id,
    user: userId
  });

  const updatedPost = await Post.findByIdAndUpdate(
    post._id,
    {
      $inc: {
        likesCount: 1
      }
    },
    {
      new: true
    }
  );

  const sender = await User.findById(userId).select("name");

  await createNotification({
    receiver: post.author._id,
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
        postId: post._id,
        isLikedByMe: true,
        likesCount: updatedPost.likesCount
      },
      "Post liked successfully"
    )
  );
});

export const unlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const { post } = await canViewPost(postId, userId);

  const existingLike = await Like.findOne({
    post: post._id,
    user: userId
  });

  if (!existingLike) {
    throw new ApiError(409, "You have not liked this post yet");
  }

  await Like.findByIdAndDelete(existingLike._id);

  const updatedPost = await Post.findByIdAndUpdate(
    post._id,
    {
      $inc: {
        likesCount: -1
      }
    },
    {
      new: true
    }
  );

  if (updatedPost.likesCount < 0) {
    updatedPost.likesCount = 0;
    await updatedPost.save({ validateBeforeSave: false });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        postId: post._id,
        isLikedByMe: false,
        likesCount: updatedPost.likesCount
      },
      "Post unliked successfully"
    )
  );
});

export const getLikeStatus = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const { post } = await canViewPost(postId, userId);

  const existingLike = await Like.findOne({
    post: post._id,
    user: userId
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        postId: post._id,
        isLikedByMe: Boolean(existingLike),
        likesCount: post.likesCount
      },
      "Like status fetched successfully"
    )
  );
});

export const getPostLikedUsers = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 && limit <= 50 ? limit : 20;
  const skip = (safePage - 1) * safeLimit;

  const { post } = await canViewPost(postId, req.user._id);

  const totalLikes = await Like.countDocuments({
    post: post._id
  });

  const likes = await Like.find({
    post: post._id
  })
    .populate({
      path: "user",
      select: "name username avatar bio followersCount followingCount status"
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);

  const users = likes
    .map((like) => like.user)
    .filter((user) => user && user.status === "active")
    .map((user) => {
      const userObject = user.toObject();

      delete userObject.status;

      return userObject;
    });

  const totalPages = Math.ceil(totalLikes / safeLimit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page: safePage,
          limit: safeLimit,
          totalPages,
          totalLikes
        }
      },
      "Post liked users fetched successfully"
    )
  );
});