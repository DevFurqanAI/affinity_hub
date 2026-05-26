import User from "../models/User.model.js";
import Ban from "../models/Ban.model.js";
import Report from "../models/Report.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const adminUserSelect =
  "_id name username email avatar role status isVerified authProvider followersCount followingCount deactivatedAt suspensionReason suspendedAt suspendedBy createdAt lastLogin";

const adminPopulate = {
  path: "admin",
  select: "_id name username avatar role"
};

const endedByPopulate = {
  path: "endedBy",
  select: "_id name username avatar role"
};

const suspendedByPopulate = {
  path: "suspendedBy",
  select: "_id name username avatar role"
};

const bannedUserPopulate = {
  path: "user",
  select: adminUserSelect
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

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getRestoredStatusAfterBan = (ban) => {
  const restorableStatuses = ["active", "suspended", "deactivated"];

  return restorableStatuses.includes(ban.previousStatus)
    ? ban.previousStatus
    : "active";
};

/*
|--------------------------------------------------------------------------
| Close Naturally Expired Bans
|--------------------------------------------------------------------------
| An admin dashboard may be opened before the banned user attempts another
| request. This cleanup keeps dashboard statistics and ban history accurate.
|--------------------------------------------------------------------------
*/
const closeExpiredBans = async () => {
  const expiredBans = await Ban.find({
    isActive: true,
    expiresAt: {
      $ne: null,
      $lte: new Date()
    }
  });

  for (const ban of expiredBans) {
    ban.isActive = false;
    ban.endType = "expired";
    ban.endedAt = new Date();

    await ban.save({ validateBeforeSave: false });

    const user = await User.findById(ban.user);

    if (user && user.status === "banned") {
      user.status = getRestoredStatusAfterBan(ban);

      await user.save({ validateBeforeSave: false });
    }
  }
};

const getUpdatedAdminUser = async (userId) => {
  return User.findById(userId)
    .select(adminUserSelect)
    .populate(suspendedByPopulate);
};

/*
|--------------------------------------------------------------------------
| GET /api/admin/stats
|--------------------------------------------------------------------------
*/
export const getAdminStats = asyncHandler(async (req, res) => {
  await closeExpiredBans();

  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    suspendedUsers,
    deactivatedUsers,
    totalReports,
    pendingReports,
    actionTakenReports,
    activeBans
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", status: "active" }),
    User.countDocuments({ role: "user", status: "banned" }),
    User.countDocuments({ role: "user", status: "suspended" }),
    User.countDocuments({ role: "user", status: "deactivated" }),
    Report.countDocuments(),
    Report.countDocuments({ status: "pending" }),
    Report.countDocuments({ status: "action_taken" }),
    Ban.countDocuments({ isActive: true })
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalUsers,
          activeUsers,
          bannedUsers,
          suspendedUsers,
          deactivatedUsers,
          totalReports,
          pendingReports,
          actionTakenReports,
          activeBans
        }
      },
      "Admin statistics fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/admin/users
|--------------------------------------------------------------------------
*/
export const getAdminUsers = asyncHandler(async (req, res) => {
  await closeExpiredBans();

  const { page, limit, skip } = getPaginationValues(req);
  const q = (req.query.q || "").trim();
  const { status = "", role = "" } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (role) {
    query.role = role;
  }

  if (q) {
    const safeQuery = escapeRegex(q);

    query.$or = [
      {
        name: {
          $regex: safeQuery,
          $options: "i"
        }
      },
      {
        username: {
          $regex: safeQuery,
          $options: "i"
        }
      },
      {
        email: {
          $regex: safeQuery,
          $options: "i"
        }
      }
    ];
  }

  const totalUsers = await User.countDocuments(query);

  const users = await User.find(query)
    .select(adminUserSelect)
    .populate(suspendedByPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const userIds = users.map((user) => user._id);

  const latestBans = await Ban.find({
    user: {
      $in: userIds
    }
  })
    .populate(adminPopulate)
    .populate(endedByPopulate)
    .sort({ createdAt: -1 });

  const latestBanByUser = new Map();

  latestBans.forEach((ban) => {
    const userId = ban.user.toString();

    if (!latestBanByUser.has(userId)) {
      latestBanByUser.set(userId, ban);
    }
  });

  const usersWithModeration = users.map((user) => {
    const userObject = user.toObject();
    const latestBan = latestBanByUser.get(user._id.toString()) || null;

    return {
      ...userObject,
      latestBan,
      activeBan: latestBan?.isActive ? latestBan : null
    };
  });

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: usersWithModeration,
        pagination: {
          page,
          limit,
          totalPages,
          totalUsers
        }
      },
      "Admin users fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/admin/bans
|--------------------------------------------------------------------------
*/
export const getAdminBans = asyncHandler(async (req, res) => {
  await closeExpiredBans();

  const { page, limit, skip } = getPaginationValues(req);
  const state = req.query.state || "active";

  const query = {};

  if (state === "active") {
    query.isActive = true;
  }

  if (state === "ended") {
    query.isActive = false;
  }

  const totalBans = await Ban.countDocuments(query);

  const bans = await Ban.find(query)
    .populate(bannedUserPopulate)
    .populate(adminPopulate)
    .populate(endedByPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalBans / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bans,
        pagination: {
          page,
          limit,
          totalPages,
          totalBans
        }
      },
      "Admin bans fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/users/:userId/suspend
|--------------------------------------------------------------------------
| Admin only. Temporarily restrict an active user account.
|--------------------------------------------------------------------------
*/
export const suspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot suspend your own account");
  }

  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "You cannot suspend another admin");
  }

  if (user.status === "banned") {
    throw new ApiError(
      409,
      "Banned accounts must be managed through Ban Management"
    );
  }

  if (user.status === "deactivated") {
    throw new ApiError(
      409,
      "A deactivated account cannot be suspended"
    );
  }

  if (user.status === "suspended") {
    throw new ApiError(409, "User is already suspended");
  }

  if (user.status !== "active") {
    throw new ApiError(409, "Only active accounts can be suspended");
  }

  user.status = "suspended";
  user.suspensionReason = reason;
  user.suspendedAt = new Date();
  user.suspendedBy = req.user._id;

  /*
  |--------------------------------------------------------------------------
  | Session Safety
  |--------------------------------------------------------------------------
  | Existing access tokens are blocked by auth middleware because status is
  | now suspended. Clearing refreshToken prevents future session refresh.
  |--------------------------------------------------------------------------
  */
  user.refreshToken = null;

  await user.save({ validateBeforeSave: false });

  const updatedUser = await getUpdatedAdminUser(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser
      },
      "User suspended successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/users/:userId/restore
|--------------------------------------------------------------------------
| Admin only. Restore normal access for a suspended account.
|--------------------------------------------------------------------------
*/
export const restoreSuspendedUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot restore your own account here");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "You cannot modify another admin");
  }

  if (user.status !== "suspended") {
    throw new ApiError(409, "Only suspended accounts can be restored");
  }

  user.status = "active";
  user.suspensionReason = "";
  user.suspendedAt = null;
  user.suspendedBy = null;

  await user.save({ validateBeforeSave: false });

  const updatedUser = await getUpdatedAdminUser(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser
      },
      "User access restored successfully"
    )
  );
});