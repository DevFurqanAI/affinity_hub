import mongoose from "mongoose";

import Report from "../models/Report.model.js";
import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import Comment from "../models/Comment.model.js";
import Story from "../models/Story.model.js";
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
    const story = await Story.findById(targetId);

    if (!story) {
      throw new ApiError(404, "Reported story not found");
    }

    return story;
  }

  throw new ApiError(400, "Invalid target type");
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

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { report: populatedReport },
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

  const totalPages = Math.ceil(totalReports / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reports,
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
| Admin only. Update report status.
*/
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  report.status = status;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();

  await report.save();

  const updatedReport = await Report.findById(report._id)
    .populate(reporterPopulate)
    .populate(reviewerPopulate);

  /*
  |--------------------------------------------------------------------------
  | Optional Notification
  |--------------------------------------------------------------------------
  | This tells the reporter that an admin reviewed their report.
  */
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
        report: updatedReport
      },
      "Report status updated successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/reports/:reportId
|--------------------------------------------------------------------------
| Admin only. Delete report.
*/
export const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  await Report.findByIdAndDelete(report._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Report deleted successfully"));
});