import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";
import Report from "../models/Report.model.js";
import Ban from "../models/Ban.model.js";
import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import Comment from "../models/Comment.model.js";
import Story from "../models/Story.model.js";
import StoryView from "../models/StoryView.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";

const reporterPopulate = {
  path: "reporter",
  select: "name username avatar role status"
};

const reviewerPopulate = {
  path: "reviewedBy",
  select: "name username avatar role"
};

const targetUserSelect = "_id name username avatar role status";

const targetAuthorPopulate = {
  path: "author",
  select: targetUserSelect
};

const targetStoryUserPopulate = {
  path: "user",
  select: targetUserSelect
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
  const restorableStatuses = ["active", "suspended", "deactivated"];

  return restorableStatuses.includes(ban.previousStatus)
    ? ban.previousStatus
    : "active";
};

const closeExpiredBanForUser = async (user) => {
  const activeBan = await Ban.findOne({
    user: user._id,
    isActive: true
  }).sort({ createdAt: -1 });

  if (!activeBan) {
    return;
  }

  if (!activeBan.expiresAt || activeBan.expiresAt > new Date()) {
    return;
  }

  activeBan.isActive = false;
  activeBan.endType = "expired";
  activeBan.endedAt = new Date();

  await activeBan.save({ validateBeforeSave: false });

  if (user.status === "banned") {
    user.status = getRestoredStatusAfterBan(activeBan);
    await user.save({ validateBeforeSave: false });
  }
};

const addTargetDetailsToReport = async (report) => {
  const reportObject = report.toObject ? report.toObject() : { ...report };

  let target = null;

  if (report.targetType === "user") {
    target = await User.findById(report.targetId).select(targetUserSelect);
  }

  if (report.targetType === "post") {
    target = await Post.findById(report.targetId)
      .select("author caption media mediaType isDeleted createdAt")
      .populate(targetAuthorPopulate);
  }

  if (report.targetType === "comment") {
    target = await Comment.findById(report.targetId)
      .select("author post content isDeleted createdAt")
      .populate(targetAuthorPopulate);
  }

  if (report.targetType === "story") {
    target = await Story.findById(report.targetId)
      .select("user caption media mediaType isDeleted expiresAt createdAt")
      .populate(targetStoryUserPopulate);
  }

  return {
    ...reportObject,
    target
  };
};

const addTargetDetailsToReports = async (reports) => {
  return Promise.all(
    reports.map((report) => addTargetDetailsToReport(report))
  );
};

const getReportTargetForAction = async (report) => {
  if (report.targetType === "user") {
    const user = await User.findById(report.targetId);

    if (!user) {
      throw new ApiError(404, "Reported user not found");
    }

    return user;
  }

  if (report.targetType === "post") {
    const post = await Post.findOne({
      _id: report.targetId,
      isDeleted: false
    });

    if (!post) {
      throw new ApiError(404, "Reported post is unavailable or already removed");
    }

    return post;
  }

  if (report.targetType === "comment") {
    const comment = await Comment.findOne({
      _id: report.targetId,
      isDeleted: false
    });

    if (!comment) {
      throw new ApiError(
        404,
        "Reported comment is unavailable or already removed"
      );
    }

    return comment;
  }

  if (report.targetType === "story") {
    const story = await Story.findOne({
      _id: report.targetId,
      isDeleted: false,
      expiresAt: {
        $gt: new Date()
      }
    });

    if (!story) {
      throw new ApiError(
        404,
        "Reported story is unavailable, removed, or expired"
      );
    }

    return story;
  }

  throw new ApiError(400, "Invalid report target type");
};

const checkTargetExists = async (targetType, targetId) => {
  if (!isValidMongoId(targetId)) {
    throw new ApiError(400, "Invalid target id");
  }

  if (targetType === "user") {
    const user = await User.findById(targetId);

    if (!user) {
      throw new ApiError(404, "Reported user not found");
    }

    return user;
  }

  if (targetType === "post") {
    const post = await Post.findOne({
      _id: targetId,
      isDeleted: false
    });

    if (!post) {
      throw new ApiError(404, "Reported post not found");
    }

    return post;
  }

  if (targetType === "comment") {
    const comment = await Comment.findOne({
      _id: targetId,
      isDeleted: false
    });

    if (!comment) {
      throw new ApiError(404, "Reported comment not found");
    }

    return comment;
  }

  if (targetType === "story") {
    const story = await Story.findOne({
      _id: targetId,
      isDeleted: false,
      expiresAt: {
        $gt: new Date()
      }
    });

    if (!story) {
      throw new ApiError(404, "Reported story not found");
    }

    return story;
  }

  throw new ApiError(400, "Invalid target type");
};

const getTargetOwner = async (report, target) => {
  if (report.targetType === "user") {
    return target;
  }

  const ownerId =
    report.targetType === "story" ? target.user : target.author;

  const owner = await User.findById(ownerId);

  if (!owner) {
    throw new ApiError(404, "Reported content owner not found");
  }

  return owner;
};

const destroyMediaSafely = async (media, mediaType) => {
  if (!media?.publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: mediaType === "video" ? "video" : "image"
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Moderation Visibility Comes First
    |--------------------------------------------------------------------------
    | Content is still hidden in MongoDB even when external media cleanup
    | fails temporarily. Storage cleanup can be retried later.
    |--------------------------------------------------------------------------
    */
    console.error("Moderation media cleanup failed:", error.message);
  }
};

const removeReportedContent = async (report, target) => {
  if (report.targetType === "post") {
    target.isDeleted = true;
    await target.save({ validateBeforeSave: false });

    await destroyMediaSafely(target.media, target.mediaType);

    return;
  }

  if (report.targetType === "comment") {
    target.isDeleted = true;
    await target.save({ validateBeforeSave: false });

    const post = await Post.findByIdAndUpdate(
      target.post,
      {
        $inc: {
          commentsCount: -1
        }
      },
      {
        new: true
      }
    );

    if (post && post.commentsCount < 0) {
      post.commentsCount = 0;
      await post.save({ validateBeforeSave: false });
    }

    return;
  }

  if (report.targetType === "story") {
    target.isDeleted = true;
    await target.save({ validateBeforeSave: false });

    await destroyMediaSafely(target.media, target.mediaType);

    await StoryView.deleteMany({
      story: target._id
    });

    return;
  }

  throw new ApiError(400, "This report target does not contain removable content");
};

const banReportedUser = async ({
  targetUser,
  adminId,
  reason,
  expiresAt
}) => {
  if (targetUser._id.toString() === adminId.toString()) {
    throw new ApiError(400, "You cannot ban yourself");
  }

  if (targetUser.role === "admin") {
    throw new ApiError(403, "You cannot ban another admin");
  }

  await closeExpiredBanForUser(targetUser);

  if (targetUser.status === "banned") {
    throw new ApiError(409, "User is already banned");
  }

  const previousStatus = ["active", "suspended", "deactivated"].includes(
    targetUser.status
  )
    ? targetUser.status
    : "active";

  const ban = await Ban.create({
    user: targetUser._id,
    admin: adminId,
    reason,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    previousStatus
  });

  targetUser.status = "banned";
  await targetUser.save({ validateBeforeSave: false });

  await createNotification({
    receiver: targetUser._id,
    sender: adminId,
    type: "ban",
    referenceId: ban._id,
    message: `Your account has been banned. Reason: ${reason}`
  });

  return ban;
};

/*
|--------------------------------------------------------------------------
| POST /api/reports
|--------------------------------------------------------------------------
| Authenticated users can report user/post/comment/story.
*/
export const createReport = asyncHandler(async (req, res) => {
  const { targetId, targetType, reason } = req.body;

  if (targetType === "user" && targetId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot report yourself");
  }

  await checkTargetExists(targetType, targetId);

  const existingReport = await Report.findOne({
    reporter: req.user._id,
    targetId,
    targetType
  });

  if (existingReport) {
    throw new ApiError(409, "You have already reported this target");
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetId,
    targetType,
    reason
  });

  const populatedReport = await Report.findById(report._id)
    .populate(reporterPopulate)
    .populate(reviewerPopulate);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        report: populatedReport
      },
      "Report submitted successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/reports
|--------------------------------------------------------------------------
| Admin only. View all reports with optional filters.
*/
export const getAllReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);
  const { status, targetType } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (targetType) {
    query.targetType = targetType;
  }

  const totalReports = await Report.countDocuments(query);

  const reports = await Report.find(query)
    .populate(reporterPopulate)
    .populate(reviewerPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const reportsWithTargets = await addTargetDetailsToReports(reports);

  const totalPages = Math.ceil(totalReports / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reports: reportsWithTargets,
        pagination: {
          page,
          limit,
          totalPages,
          totalReports
        }
      },
      "Reports fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/reports/:reportId/status
|--------------------------------------------------------------------------
| Admin only. Mark report reviewed or rejected without moderation action.
*/
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  if (report.status === "action_taken") {
    throw new ApiError(
      409,
      "A report with completed moderation action cannot be changed"
    );
  }

  report.status = status;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();

  await report.save();

  const updatedReport = await Report.findById(report._id)
    .populate(reporterPopulate)
    .populate(reviewerPopulate);

  const updatedReportWithTarget = await addTargetDetailsToReport(updatedReport);

  await createNotification({
    receiver: report.reporter,
    sender: req.user._id,
    type: "report_action",
    referenceId: report._id,
    message: `Your report has been marked as ${status.replace("_", " ")}`
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        report: updatedReportWithTarget
      },
      "Report status updated successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/reports/:reportId/action
|--------------------------------------------------------------------------
| Admin only. Perform a real moderation action.
*/
export const takeReportAction = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const {
    action,
    moderationNote = "",
    banReason,
    expiresAt = null
  } = req.body;

  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  if (report.status === "action_taken") {
    throw new ApiError(409, "Moderation action has already been completed");
  }

  if (report.status === "rejected") {
    throw new ApiError(
      409,
      "A rejected report cannot receive moderation action"
    );
  }

  const actionRemovesContent =
    action === "content_removed" ||
    action === "content_removed_and_user_banned";

  const actionBansUser =
    action === "user_banned" ||
    action === "content_removed_and_user_banned";

  if (report.targetType === "user" && actionRemovesContent) {
    throw new ApiError(400, "A user report does not contain removable content");
  }

  if (report.targetType !== "user" && action === "user_banned") {
    throw new ApiError(
      400,
      "Content reports must use remove content or remove content and ban"
    );
  }

  const target = await getReportTargetForAction(report);
  const targetUser = await getTargetOwner(report, target);

  let ban = null;

  if (actionBansUser) {
    ban = await banReportedUser({
      targetUser,
      adminId: req.user._id,
      reason: banReason,
      expiresAt
    });
  }

  if (actionRemovesContent) {
    await removeReportedContent(report, target);

    await createNotification({
      receiver: targetUser._id,
      sender: req.user._id,
      type: "report_action",
      referenceId: report._id,
      message: `Your ${report.targetType} was removed by moderation`
    });
  }

  report.status = "action_taken";
  report.moderationAction = action;
  report.moderationNote = moderationNote;
  report.moderationBan = ban?._id || null;
  report.actionTakenAt = new Date();
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();

  await report.save();

  const updatedReport = await Report.findById(report._id)
    .populate(reporterPopulate)
    .populate(reviewerPopulate);

  const updatedReportWithTarget = await addTargetDetailsToReport(updatedReport);

  const actionLabels = {
    content_removed: "content removed",
    user_banned: "reported user banned",
    content_removed_and_user_banned: "content removed and user banned"
  };

  await createNotification({
    receiver: report.reporter,
    sender: req.user._id,
    type: "report_action",
    referenceId: report._id,
    message: `Action taken on your report: ${actionLabels[action]}`
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        report: updatedReportWithTarget
      },
      "Moderation action completed successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/reports/:reportId
|--------------------------------------------------------------------------
| Admin only. Delete reports that do not contain completed action history.
*/
export const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  if (report.status === "action_taken") {
    throw new ApiError(
      409,
      "Reports with completed moderation actions must remain in history"
    );
  }

  await Report.findByIdAndDelete(report._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Report deleted successfully"));
});