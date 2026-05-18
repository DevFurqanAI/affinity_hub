import mongoose from "mongoose";

import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import ApiError from "./ApiError.js";
import { hasBlockRelation } from "./block.helpers.js";

const authorPopulate = {
  path: "author",
  select: "name username avatar status"
};

const isViewerFollowingAuthor = async (viewerId, authorId) => {
  const viewer = await User.findById(viewerId).select("following");

  if (!viewer) {
    return false;
  }

  return viewer.following.some(
    (followingId) => followingId.toString() === authorId.toString()
  );
};

const canViewPost = async (postId, viewerId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  }).populate(authorPopulate);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (!post.author || post.author.status !== "active") {
    throw new ApiError(404, "Post not found");
  }

  const authorId = post.author._id;
  const isOwner = authorId.toString() === viewerId.toString();

  if (isOwner) {
    return {
      post,
      isOwner: true
    };
  }

  const isBlocked = await hasBlockRelation(viewerId, authorId);

  if (isBlocked) {
    throw new ApiError(403, "You cannot access this post");
  }

  if (post.visibility === "private") {
    throw new ApiError(403, "You cannot view this private post");
  }

  if (post.visibility === "followers") {
    const isFollowing = await isViewerFollowingAuthor(viewerId, authorId);

    if (!isFollowing) {
      throw new ApiError(403, "Only followers can view this post");
    }
  }

  return {
    post,
    isOwner: false
  };
};

export default canViewPost;