import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import Like from "../models/Like.model.js";
import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Block from "../models/Block.model.js";

const authorPopulate = {
  path: "author",
  select: "name username avatar status"
};

const checkCloudinaryConfig = () => {
  if (
    !env.cloudinaryCloudName ||
    !env.cloudinaryApiKey ||
    !env.cloudinaryApiSecret
  ) {
    throw new ApiError(
      500,
      "Cloudinary configuration is missing. Please check server/.env"
    );
  }
};

const getMediaTypeFromMime = (mimeType) => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "none";
};

const uploadBufferToCloudinary = (fileBuffer, mediaType) => {
  checkCloudinaryConfig();

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

const removePostsFromInactiveAuthors = (posts) => {
  return posts.filter((post) => post.author && post.author.status === "active");
};

const cleanPostAuthorStatus = (posts) => {
  return posts.map((post) => {
    const postObject = post.toObject ? post.toObject() : post;

    if (postObject.author) {
      delete postObject.author.status;
    }

    return postObject;
  });
};

const isUserFollowingAuthor = async (userId, authorId) => {
  const user = await User.findById(userId).select("following");

  if (!user) {
    return false;
  }

  return user.following.some(
    (followingId) => followingId.toString() === authorId.toString()
  );
};

const addLikeStatusToPosts = async (posts, userId) => {
  const cleanPosts = cleanPostAuthorStatus(posts);

  const postIds = cleanPosts.map((post) => post._id);

  const likedPosts = await Like.find({
    post: {
      $in: postIds
    },
    user: userId
  }).select("post");

  const likedPostIds = new Set(
    likedPosts.map((like) => like.post.toString())
  );

  return cleanPosts.map((post) => ({
    ...post,
    isLikedByMe: likedPostIds.has(post._id.toString())
  }));
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

/*
|--------------------------------------------------------------------------
| POST /api/posts
|--------------------------------------------------------------------------
*/
export const createPost = asyncHandler(async (req, res) => {
  const { caption = "", visibility = "public" } = req.body;

  let media = {
    url: "",
    publicId: ""
  };

  let mediaType = "none";

  if (req.file) {
    mediaType = getMediaTypeFromMime(req.file.mimetype);

    try {
      const uploadedMedia = await uploadBufferToCloudinary(
        req.file.buffer,
        mediaType
      );

      media = {
        url: uploadedMedia.secure_url,
        publicId: uploadedMedia.public_id
      };
    } catch (error) {
      console.error("Cloudinary post media upload error:", error);

      throw new ApiError(
        500,
        "Post media upload failed. Please check Cloudinary credentials or internet connection."
      );
    }
  }

  if (!caption.trim() && mediaType === "none") {
    throw new ApiError(400, "Post must have a caption or media");
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
      { post: postsWithLikeStatus[0] },
      "Post created successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/posts/feed
|--------------------------------------------------------------------------
*/
export const getFeedPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);

  const currentUser = await User.findById(req.user._id).select("following");

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  const blockedUserIds = await getBlockedUserIdsForCurrentUser(req.user._id);

  const allowedFollowingIds = currentUser.following.filter(
    (userId) =>
      !blockedUserIds.some(
        (blockedId) => blockedId.toString() === userId.toString()
      )
  );

  const authorIds = [req.user._id, ...allowedFollowingIds];

  const query = {
    author: {
      $in: authorIds,
      $nin: blockedUserIds
    },
    isDeleted: false,
    visibility: {
      $in: ["public", "followers"]
    }
  };

  const totalPosts = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .populate(authorPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const activeAuthorPosts = removePostsFromInactiveAuthors(posts);

  const postsWithLikeStatus = await addLikeStatusToPosts(
    activeAuthorPosts,
    req.user._id
  );

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

/*
|--------------------------------------------------------------------------
| GET /api/posts/explore
|--------------------------------------------------------------------------
*/
export const getExplorePosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);

  const blockedUserIds = await getBlockedUserIdsForCurrentUser(req.user._id);

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

/*
|--------------------------------------------------------------------------
| GET /api/posts/:postId
|--------------------------------------------------------------------------
*/
export const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

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

  const isOwner = post.author._id.toString() === req.user._id.toString();

  if (isOwner) {
    const postsWithLikeStatus = await addLikeStatusToPosts([post], req.user._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        { post: postsWithLikeStatus[0] },
        "Post fetched successfully"
      )
    );
  }

  if (post.visibility === "private") {
    throw new ApiError(403, "You cannot view this private post");
  }

  if (post.visibility === "followers") {
    const isFollowing = await isUserFollowingAuthor(
      req.user._id,
      post.author._id
    );

    if (!isFollowing) {
      throw new ApiError(
        403,
        "Only followers can view this post"
      );
    }
  }

  const postsWithLikeStatus = await addLikeStatusToPosts([post], req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { post: postsWithLikeStatus[0] },
      "Post fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/posts/:postId
|--------------------------------------------------------------------------
*/
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
    throw new ApiError(403, "You can only edit your own posts");
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
      { post: postsWithLikeStatus[0] },
      "Post updated successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/posts/:postId
|--------------------------------------------------------------------------
*/
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
    throw new ApiError(403, "You can only delete your own posts");
  }

  post.isDeleted = true;
  await post.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Post deleted successfully"));
});

/*
|--------------------------------------------------------------------------
| GET /api/posts/user/:username
|--------------------------------------------------------------------------
*/
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

  const blockedRelation = await Block.findOne({
    $or: [
      {
        blocker: req.user._id,
        blocked: user._id
      },
      {
        blocker: user._id,
        blocked: req.user._id
      }
    ]
  });

  if (blockedRelation && user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot view posts from this user");
  }

  const isOwnProfile = user._id.toString() === req.user._id.toString();

  const visibilityFilter = isOwnProfile
    ? ["public", "followers", "private"]
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