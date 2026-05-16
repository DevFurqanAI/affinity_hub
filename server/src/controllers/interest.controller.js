import Interest from "../models/Interest.model.js";
import UserInterest from "../models/UserInterest.model.js";
import PostInterest from "../models/PostInterest.model.js";
import NewInterestCounter from "../models/NewInterestCounter.model.js";
import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const authorPopulate = {
  path: "author",
  select: "name username avatar"
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

const updateInterestCounters = async (interestIds) => {
  for (const interestId of interestIds) {
    const userCount = await UserInterest.countDocuments({
      interest: interestId
    });

    const postCount = await PostInterest.countDocuments({
      interest: interestId
    });

    await NewInterestCounter.findOneAndUpdate(
      {
        interest: interestId
      },
      {
        $set: {
          userCount,
          postCount
        }
      },
      {
        upsert: true,
        new: true
      }
    );
  }
};

/*
|--------------------------------------------------------------------------
| Seed Default Interests If Empty
|--------------------------------------------------------------------------
| This keeps the semester project easy to test.
| If there are no interests, this function creates basic interests.
*/
const seedDefaultInterestsIfNeeded = async () => {
  const count = await Interest.countDocuments();

  if (count > 0) {
    return;
  }

  const defaultInterests = [
    {
      name: "technology",
      displayName: "Technology",
      description: "Programming, gadgets, AI, and digital trends"
    },
    {
      name: "fitness",
      displayName: "Fitness",
      description: "Gym, health, workouts, and lifestyle"
    },
    {
      name: "education",
      displayName: "Education",
      description: "Learning, exams, university, and study life"
    },
    {
      name: "travel",
      displayName: "Travel",
      description: "Places, trips, culture, and exploration"
    },
    {
      name: "food",
      displayName: "Food",
      description: "Recipes, restaurants, and food experiences"
    },
    {
      name: "gaming",
      displayName: "Gaming",
      description: "Games, esports, and gaming communities"
    },
    {
      name: "music",
      displayName: "Music",
      description: "Songs, artists, instruments, and concerts"
    },
    {
      name: "sports",
      displayName: "Sports",
      description: "Cricket, football, and sports discussions"
    },
    {
      name: "art",
      displayName: "Art",
      description: "Design, drawing, creativity, and visual arts"
    },
    {
      name: "business",
      displayName: "Business",
      description: "Startups, entrepreneurship, and finance"
    }
  ];

  await Interest.insertMany(defaultInterests);
};

/*
|--------------------------------------------------------------------------
| GET /api/interests
|--------------------------------------------------------------------------
| Returns all active interests.
*/
export const getAllInterests = asyncHandler(async (req, res) => {
  await seedDefaultInterestsIfNeeded();

  const interests = await Interest.find({
    isActive: true
  }).sort({ displayName: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { interests }, "Interests fetched successfully")
    );
});

/*
|--------------------------------------------------------------------------
| POST /api/interests/user
|--------------------------------------------------------------------------
| Logged-in user selects interests.
| This replaces old interests with new selected interests.
*/
export const setMyInterests = asyncHandler(async (req, res) => {
  const { interestIds } = req.body;

  const validInterests = await Interest.find({
    _id: {
      $in: interestIds
    },
    isActive: true
  }).select("_id");

  if (validInterests.length !== interestIds.length) {
    throw new ApiError(400, "One or more interests are invalid");
  }

  const oldUserInterests = await UserInterest.find({
    user: req.user._id
  }).select("interest");

  const affectedInterestIds = [
    ...oldUserInterests.map((item) => item.interest.toString()),
    ...interestIds
  ];

  await UserInterest.deleteMany({
    user: req.user._id
  });

  const userInterestDocs = interestIds.map((interestId) => ({
    user: req.user._id,
    interest: interestId
  }));

  await UserInterest.insertMany(userInterestDocs);

  await updateInterestCounters([...new Set(affectedInterestIds)]);

  const selectedInterests = await UserInterest.find({
    user: req.user._id
  }).populate("interest");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        interests: selectedInterests.map((item) => item.interest)
      },
      "User interests updated successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/interests/user/me
|--------------------------------------------------------------------------
| Returns logged-in user's selected interests.
*/
export const getMyInterests = asyncHandler(async (req, res) => {
  const userInterests = await UserInterest.find({
    user: req.user._id
  })
    .populate("interest")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        interests: userInterests.map((item) => item.interest)
      },
      "User interests fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| POST /api/interests/post/:postId
|--------------------------------------------------------------------------
| Owner tags their post with interests.
*/
export const setPostInterests = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { interestIds } = req.body;

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only tag your own posts");
  }

  const validInterests = await Interest.find({
    _id: {
      $in: interestIds
    },
    isActive: true
  }).select("_id");

  if (validInterests.length !== interestIds.length) {
    throw new ApiError(400, "One or more interests are invalid");
  }

  const oldPostInterests = await PostInterest.find({
    post: postId
  }).select("interest");

  const affectedInterestIds = [
    ...oldPostInterests.map((item) => item.interest.toString()),
    ...interestIds
  ];

  await PostInterest.deleteMany({
    post: postId
  });

  const postInterestDocs = interestIds.map((interestId) => ({
    post: postId,
    interest: interestId
  }));

  await PostInterest.insertMany(postInterestDocs);

  await updateInterestCounters([...new Set(affectedInterestIds)]);

  const selectedPostInterests = await PostInterest.find({
    post: postId
  }).populate("interest");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        postId,
        interests: selectedPostInterests.map((item) => item.interest)
      },
      "Post interests updated successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/interests/recommended-users
|--------------------------------------------------------------------------
| Recommend active users who share interests with logged-in user.
*/
export const getRecommendedUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);

  const myInterests = await UserInterest.find({
    user: req.user._id
  }).select("interest");

  const myInterestIds = myInterests.map((item) => item.interest);

  if (myInterestIds.length === 0) {
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
        "Please select interests to get user recommendations"
      )
    );
  }

  const matchingUserInterests = await UserInterest.aggregate([
    {
      $match: {
        interest: {
          $in: myInterestIds
        },
        user: {
          $ne: req.user._id
        }
      }
    },
    {
      $group: {
        _id: "$user",
        sharedInterestsCount: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        sharedInterestsCount: -1
      }
    }
  ]);

  const matchingUserIds = matchingUserInterests.map((item) => item._id);

  const activeUsersQuery = {
    _id: {
      $in: matchingUserIds
    },
    status: "active"
  };

  const totalUsers = await User.countDocuments(activeUsersQuery);

  const users = await User.find(activeUsersQuery)
    .select(
      "name username bio avatar followersCount followingCount createdAt updatedAt"
    )
    .skip(skip)
    .limit(limit);

  const userScoreMap = new Map(
    matchingUserInterests.map((item) => [
      item._id.toString(),
      item.sharedInterestsCount
    ])
  );

  const usersWithScore = users
    .map((user) => {
      const userObject = user.toObject();

      userObject.sharedInterestsCount =
        userScoreMap.get(user._id.toString()) || 0;

      return userObject;
    })
    .sort((a, b) => b.sharedInterestsCount - a.sharedInterestsCount);

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: usersWithScore,
        pagination: {
          page,
          limit,
          totalPages,
          totalUsers
        }
      },
      "Recommended users fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/interests/recommended-posts
|--------------------------------------------------------------------------
| Recommend public posts that match logged-in user's interests.
*/
export const getRecommendedPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);

  const myInterests = await UserInterest.find({
    user: req.user._id
  }).select("interest");

  const myInterestIds = myInterests.map((item) => item.interest);

  if (myInterestIds.length === 0) {
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
        "Please select interests to get post recommendations"
      )
    );
  }

  const matchingPostInterests = await PostInterest.aggregate([
    {
      $match: {
        interest: {
          $in: myInterestIds
        }
      }
    },
    {
      $group: {
        _id: "$post",
        matchedInterestsCount: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        matchedInterestsCount: -1
      }
    }
  ]);

  const matchingPostIds = matchingPostInterests.map((item) => item._id);

  const activeUsers = await User.find({
    status: "active"
  }).select("_id");

  const activeUserIds = activeUsers.map((user) => user._id);

  const postQuery = {
    _id: {
      $in: matchingPostIds
    },
    author: {
      $in: activeUserIds
    },
    isDeleted: false,
    visibility: "public"
  };

  const totalPosts = await Post.countDocuments(postQuery);

  const posts = await Post.find(postQuery)
    .populate(authorPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const postScoreMap = new Map(
    matchingPostInterests.map((item) => [
      item._id.toString(),
      item.matchedInterestsCount
    ])
  );

  const postsWithScore = posts
    .map((post) => {
      const postObject = post.toObject();

      postObject.matchedInterestsCount =
        postScoreMap.get(post._id.toString()) || 0;

      return postObject;
    })
    .sort((a, b) => b.matchedInterestsCount - a.matchedInterestsCount);

  const totalPages = Math.ceil(totalPosts / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: postsWithScore,
        pagination: {
          page,
          limit,
          totalPages,
          totalPosts
        }
      },
      "Recommended posts fetched successfully"
    )
  );
});