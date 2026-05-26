import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import Like from "../models/Like.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import canViewPost from "../utils/canViewPost.js";
import { addStoryStatusToUsers } from "../utils/storyStatus.helpers.js";
import {
  getBlockedUserIdsForViewer,
  hasBlockRelation
} from "../utils/block.helpers.js";

const authorPopulate = {
  path: "author",
  select: "name username avatar status"
};

const getPaginationValues = (req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 && limit <= 50 ? limit : 10;
  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip
  };
};

const getMediaTypeFromMime = (mimeType) => {
  if (!mimeType) {
    return "none";
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "none";
};

const uploadBufferToCloudinary = (fileBuffer, mediaType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinaryFolder}/posts`,
        resource_type: mediaType === "video" ? "video" : "image"
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const addLikeStatusToPosts = async (posts, userId) => {
  const postObjects = posts.map((post) =>
    post?.toObject ? post.toObject() : { ...post }
  );

  const postIds = postObjects.map((post) => post._id);

  const likes =
    postIds.length > 0
      ? await Like.find({
          post: {
            $in: postIds
          },
          user: userId
        }).select("post")
      : [];

  const likedPostIds = new Set(
    likes.map((like) => like.post.toString())
  );

  const uniqueAuthors = new Map();

  postObjects.forEach((post) => {
    if (post.author?.status) {
      delete post.author.status;
    }

    if (post.author?._id) {
      uniqueAuthors.set(post.author._id.toString(), post.author);
    }
  });

  const authorsWithStoryStatus = await addStoryStatusToUsers(
    [...uniqueAuthors.values()],
    userId
  );

  const authorsById = new Map(
    authorsWithStoryStatus.map((author) => [
      author._id.toString(),
      author
    ])
  );

  return postObjects.map((post) => ({
    ...post,
    author: post.author?._id
      ? authorsById.get(post.author._id.toString()) || post.author
      : post.author,
    isLikedByMe: likedPostIds.has(post._id.toString())
  }));
};

export const createPost = asyncHandler(async (req, res) => {
  const { caption = "", visibility = "public" } = req.body;

  let media = {
    url: "",
    publicId: ""
  };

  let mediaType = "none";

  if (req.file) {
    mediaType = getMediaTypeFromMime(req.file.mimetype);

    if (mediaType === "none") {
      throw new ApiError(400, "Invalid media type");
    }

    const uploadedMedia = await uploadBufferToCloudinary(req.file.buffer, mediaType);

    media = {
      url: uploadedMedia.secure_url,
      publicId: uploadedMedia.public_id
    };
  }

  const post = await Post.create({
    author: req.user._id,
    caption,
    media,
    mediaType,
    visibility
  });

  const populatedPost = await Post.findById(post._id).populate(authorPopulate);

  const postsWithLikeStatus = await addLikeStatusToPosts(
    [populatedPost],
    req.user._id
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        post: postsWithLikeStatus[0]
      },
      "Post created successfully"
    )
  );
});

export const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const { post } = await canViewPost(postId, req.user._id);

  const postsWithLikeStatus = await addLikeStatusToPosts([post], req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        post: postsWithLikeStatus[0]
      },
      "Post fetched successfully"
    )
  );
});

export const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { caption, visibility } = req.body;

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own post");
  }

  if (caption !== undefined) {
    post.caption = caption;
  }

  if (visibility !== undefined) {
    post.visibility = visibility;
  }

  await post.save();

  const updatedPost = await Post.findById(post._id).populate(authorPopulate);

  const postsWithLikeStatus = await addLikeStatusToPosts(
    [updatedPost],
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        post: postsWithLikeStatus[0]
      },
      "Post updated successfully"
    )
  );
});

export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own post");
  }

  post.isDeleted = true;
  await post.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { postId }, "Post deleted successfully"));
});

export const getPostsByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page, limit, skip } = getPaginationValues(req);

  const user = await User.findOne({
    username,
    status: "active"
  }).select("_id name username avatar");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isOwnProfile = user._id.toString() === req.user._id.toString();

  if (!isOwnProfile) {
    const isBlocked = await hasBlockRelation(req.user._id, user._id);

    if (isBlocked) {
      throw new ApiError(403, "You cannot view this user's posts");
    }
  }

  const viewer = await User.findById(req.user._id).select("following");

  const isFollowing = viewer?.following?.some(
    (followingId) => followingId.toString() === user._id.toString()
  );

  const visibilityFilter = isOwnProfile
    ? ["public", "followers", "private"]
    : isFollowing
      ? ["public", "followers"]
      : ["public"];

  const query = {
    author: user._id,
    isDeleted: false,
    visibility: {
      $in: visibilityFilter
    }
  };

  const totalPosts = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .populate(authorPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const postsWithLikeStatus = await addLikeStatusToPosts(posts, req.user._id);

  const totalPages = Math.ceil(totalPosts / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          totalPages,
          totalPosts
        }
      },
      "User posts fetched successfully"
    )
  );
});

export const getFeedPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);

  const currentUser = await User.findById(req.user._id).select("following");

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  const blockedUserIds = await getBlockedUserIdsForViewer(req.user._id);

  const allowedFollowingIds = currentUser.following.filter(
    (followingId) =>
      !blockedUserIds.some(
        (blockedId) => blockedId.toString() === followingId.toString()
      )
  );

  const activeAuthors = await User.find({
    _id: {
      $in: [req.user._id, ...allowedFollowingIds]
    },
    status: "active"
  }).select("_id");

  const activeAuthorIds = activeAuthors.map((user) => user._id);

  const query = {
    author: {
      $in: activeAuthorIds
    },
    isDeleted: false,
    $or: [
      {
        author: req.user._id,
        visibility: {
          $in: ["public", "followers", "private"]
        }
      },
      {
        author: {
          $ne: req.user._id
        },
        visibility: {
          $in: ["public", "followers"]
        }
      }
    ]
  };

  const totalPosts = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .populate(authorPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const postsWithLikeStatus = await addLikeStatusToPosts(posts, req.user._id);

  const totalPages = Math.ceil(totalPosts / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          totalPages,
          totalPosts
        }
      },
      "Feed posts fetched successfully"
    )
  );
});

export const getExplorePosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);

  const blockedUserIds = await getBlockedUserIdsForViewer(req.user._id);

  const activeUsers = await User.find({
    _id: {
      $nin: blockedUserIds
    },
    status: "active"
  }).select("_id");

  const activeUserIds = activeUsers.map((user) => user._id);

  const query = {
    author: {
      $in: activeUserIds
    },
    isDeleted: false,
    visibility: "public"
  };

  const totalPosts = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .populate(authorPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const postsWithLikeStatus = await addLikeStatusToPosts(posts, req.user._id);

  const totalPages = Math.ceil(totalPosts / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          totalPages,
          totalPosts
        }
      },
      "Explore posts fetched successfully"
    )
  );
});