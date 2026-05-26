import mongoose from "mongoose";

import Ban from "../models/Ban.model.js";
import Appeal from "../models/Appeal.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";

const userPopulate = {
  path: "user",
  select: "name username email avatar role status"
};

const adminPopulate = {
  path: "admin",
  select: "name username avatar role"
};

const reviewedByPopulate = {
  path: "reviewedBy",
  select: "name username avatar role"
};

const banPopulate = {
  path: "ban",
  populate: [
    {
      path: "user",
      select: "name username email avatar role status"
    },
    {
      path: "admin",
      select: "name username avatar role"
    }
  ]
};

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
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

const getRestoredStatusAfterBan = (ban) => {
  const validPreviousStatuses = ["active", "suspended", "deactivated"];

  return validPreviousStatuses.includes(ban.previousStatus)
    ? ban.previousStatus
    : "active";
};

/*
|--------------------------------------------------------------------------
| POST /api/bans/:userId
|--------------------------------------------------------------------------
| Admin bans a user.
*/
export const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason, expiresAt } = req.body;

  if (!isValidMongoId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot ban yourself");
  }

  const userToBan = await User.findById(userId);

  if (!userToBan) {
    throw new ApiError(404, "User not found");
  }

  if (userToBan.role === "admin") {
    throw new ApiError(403, "You cannot ban another admin");
  }

  if (userToBan.status === "banned") {
    throw new ApiError(409, "User is already banned");
  }

  const activeBan = await Ban.findOne({
    user: userId,
    isActive: true,
    $or: [
      {
        expiresAt: null
      },
      {
        expiresAt: {
          $gt: new Date()
        }
      }
    ]
  });

  if (activeBan) {
    throw new ApiError(409, "User is already banned");
  }

  const previousStatus = ["active", "suspended", "deactivated"].includes(
    userToBan.status
  )
    ? userToBan.status
    : "active";

  const ban = await Ban.create({
    user: userId,
    admin: req.user._id,
    reason,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    previousStatus
  });

  userToBan.status = "banned";
  await userToBan.save({ validateBeforeSave: false });

  await createNotification({
    receiver: userToBan._id,
    sender: req.user._id,
    type: "ban",
    referenceId: ban._id,
    message: `Your account has been banned. Reason: ${reason}`
  });

  const populatedBan = await Ban.findById(ban._id)
    .populate(userPopulate)
    .populate(adminPopulate);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        ban: populatedBan
      },
      "User banned successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/bans/:banId/remove
|--------------------------------------------------------------------------
| Admin removes an active ban.
*/
export const removeBan = asyncHandler(async (req, res) => {
  const { banId } = req.params;

  if (!isValidMongoId(banId)) {
    throw new ApiError(400, "Invalid ban id");
  }

  const ban = await Ban.findById(banId);

  if (!ban) {
    throw new ApiError(404, "Ban not found");
  }

  if (!ban.isActive) {
    throw new ApiError(409, "Ban is already removed");
  }

  ban.isActive = false;
  ban.endType = "removed";
  ban.endedAt = new Date();
  ban.endedBy = req.user._id;

  await ban.save({ validateBeforeSave: false });

  const user = await User.findById(ban.user);

  if (user && user.status === "banned") {
    user.status = getRestoredStatusAfterBan(ban);

    await user.save({ validateBeforeSave: false });

    await createNotification({
      receiver: user._id,
      sender: req.user._id,
      type: "ban",
      referenceId: ban._id,
      message: "Your account ban has been removed"
    });
  }

  const populatedBan = await Ban.findById(ban._id)
    .populate(userPopulate)
    .populate(adminPopulate);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ban: populatedBan
      },
      "Ban removed successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| POST /api/bans/:banId/appeal
|--------------------------------------------------------------------------
| Banned user submits appeal.
| This route uses verifyJWTAllowBanned, so banned users can access it.
*/

/*
|--------------------------------------------------------------------------
| GET /api/bans/me/active
|--------------------------------------------------------------------------
| Restricted authenticated user views their active ban and appeal status.
*/
export const getMyActiveBan = asyncHandler(async (req, res) => {
  if (req.user.status !== "banned") {
    throw new ApiError(403, "Your account is not currently banned");
  }

  const ban = await Ban.findOne({
    user: req.user._id,
    isActive: true,
    $or: [
      {
        expiresAt: null
      },
      {
        expiresAt: {
          $gt: new Date()
        }
      }
    ]
  })
    .populate(adminPopulate)
    .sort({ createdAt: -1 });

  if (!ban) {
    throw new ApiError(
      404,
      "No active ban was found. Please sign in again to refresh your account status."
    );
  }

  const appeal = await Appeal.findOne({
    ban: ban._id,
    user: req.user._id
  })
    .populate(reviewedByPopulate)
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ban,
        appeal,
        canAppeal: !appeal
      },
      "Active ban fetched successfully"
    )
  );
});

export const submitAppeal = asyncHandler(async (req, res) => {
  const { banId } = req.params;
  const { message } = req.body;

  if (!isValidMongoId(banId)) {
    throw new ApiError(400, "Invalid ban id");
  }

  const ban = await Ban.findOne({
    _id: banId,
    isActive: true
  });

  if (!ban) {
    throw new ApiError(404, "Active ban not found");
  }

  if (ban.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only appeal your own ban");
  }

  const existingAppeal = await Appeal.findOne({
    ban: ban._id,
    user: req.user._id
  });

  if (existingAppeal) {
    throw new ApiError(
      409,
      "You have already submitted an appeal for this ban"
    );
  }

  const appeal = await Appeal.create({
    ban: ban._id,
    user: req.user._id,
    message
  });

  const populatedAppeal = await Appeal.findById(appeal._id)
    .populate(banPopulate)
    .populate(userPopulate)
    .populate(reviewedByPopulate);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        appeal: populatedAppeal
      },
      "Appeal submitted successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/bans/appeals
|--------------------------------------------------------------------------
| Admin views all appeals.
*/
export const getAppeals = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);
  const { status } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  const totalAppeals = await Appeal.countDocuments(query);

  const appeals = await Appeal.find(query)
    .populate(banPopulate)
    .populate(userPopulate)
    .populate(reviewedByPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalAppeals / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appeals,
        pagination: {
          page,
          limit,
          totalPages,
          totalAppeals
        }
      },
      "Appeals fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/bans/appeals/:appealId
|--------------------------------------------------------------------------
| Admin reviews appeal.
| If accepted and unbanUser is true, user is unbanned.
*/
export const reviewAppeal = asyncHandler(async (req, res) => {
  const { appealId } = req.params;
  const { status, unbanUser = true } = req.body;

  if (!isValidMongoId(appealId)) {
    throw new ApiError(400, "Invalid appeal id");
  }

  const appeal = await Appeal.findById(appealId);

  if (!appeal) {
    throw new ApiError(404, "Appeal not found");
  }

  if (appeal.status !== "pending") {
    throw new ApiError(409, "This appeal has already been reviewed");
  }

  const ban = await Ban.findById(appeal.ban);

  if (!ban) {
    throw new ApiError(404, "Ban not found");
  }

  appeal.status = status;
  appeal.reviewedBy = req.user._id;
  appeal.reviewedAt = new Date();

  await appeal.save({ validateBeforeSave: false });

  if (status === "accepted" && unbanUser) {
    ban.isActive = false;
    ban.endType = "appeal_accepted";
    ban.endedAt = new Date();
    ban.endedBy = req.user._id;

    await ban.save({ validateBeforeSave: false });

    const user = await User.findById(appeal.user);

    if (user && user.status === "banned") {
      user.status = getRestoredStatusAfterBan(ban);

      await user.save({ validateBeforeSave: false });
    }
  }

  const notificationMessage =
    status === "accepted"
      ? "Your ban appeal has been accepted"
      : "Your ban appeal has been rejected";

  await createNotification({
    receiver: appeal.user,
    sender: req.user._id,
    type: "appeal",
    referenceId: appeal._id,
    message: notificationMessage
  });

  const updatedAppeal = await Appeal.findById(appeal._id)
    .populate(banPopulate)
    .populate(userPopulate)
    .populate(reviewedByPopulate);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appeal: updatedAppeal
      },
      "Appeal reviewed successfully"
    )
  );
});