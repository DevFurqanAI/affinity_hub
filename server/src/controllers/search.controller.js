import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getBlockedUserIdsForViewer } from "../utils/block.helpers.js";

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

const getSearchQuery = (req) => {
  return (req.query.q || "").trim();
};

const cleanPostAuthorStatus = (posts) => {
  return posts.map((post) => {
    const postObject = post.toObject();

    if (postObject.author?.status) {
      delete postObject.author.status;
    }

    return postObject;
  });
};

export const searchUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);
  const q = getSearchQuery(req);

  if (!q) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users: [],
          pagination: {
            page,
            limit,
            totalPages: 1,
            totalUsers: 0
          }
        },
        "User search results fetched successfully"
      )
    );
  }

  const blockedUserIds = await getBlockedUserIdsForViewer(req.user._id);

  const query = {
    _id: {
      $nin: [req.user._id, ...blockedUserIds]
    },
    status: "active",
    $or: [
      {
        name: {
          $regex: q,
          $options: "i"
        }
      },
      {
        username: {
          $regex: q,
          $options: "i"
        }
      }
    ]
  };

  const totalUsers = await User.countDocuments(query);

  const users = await User.find(query)
    .select(
      "name username bio avatar followersCount followingCount createdAt updatedAt"
    )
    .sort({ followersCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page,
          limit,
          totalPages,
          totalUsers
        }
      },
      "User search results fetched successfully"
    )
  );
});

export const searchPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);
  const q = getSearchQuery(req);

  if (!q) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          posts: [],
          pagination: {
            page,
            limit,
            totalPages: 1,
            totalPosts: 0
          }
        },
        "Post search results fetched successfully"
      )
    );
  }

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
    visibility: "public",
    caption: {
      $regex: q,
      $options: "i"
    }
  };

  const totalPosts = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .populate(authorPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const cleanPosts = cleanPostAuthorStatus(posts);

  const totalPages = Math.ceil(totalPosts / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: cleanPosts,
        pagination: {
          page,
          limit,
          totalPages,
          totalPosts
        }
      },
      "Post search results fetched successfully"
    )
  );
});