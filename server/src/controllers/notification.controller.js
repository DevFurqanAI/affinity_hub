import mongoose from "mongoose";

import Notification from "../models/Notification.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const senderPopulate = {
  path: "sender",
  select: "name username avatar"
};

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getPaginationValues = (req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 && limit <= 50 ? limit : 20;
  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip
  };
};

/*
|--------------------------------------------------------------------------
| GET /api/notifications
|--------------------------------------------------------------------------
| Get logged-in user's notifications.
*/
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationValues(req);

  const query = {
    receiver: req.user._id
  };

  const totalNotifications = await Notification.countDocuments(query);

  const unreadCount = await Notification.countDocuments({
    receiver: req.user._id,
    isRead: false
  });

  const notifications = await Notification.find(query)
    .populate(senderPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalNotifications / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          totalPages,
          totalNotifications
        }
      },
      "Notifications fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/notifications/:notificationId/read
|--------------------------------------------------------------------------
| Mark one notification as read.
*/
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!isValidMongoId(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: req.user._id
  }).populate(senderPopulate);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.isRead = true;
  await notification.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { notification },
        "Notification marked as read"
      )
    );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/notifications/read-all
|--------------------------------------------------------------------------
| Mark all logged-in user's notifications as read.
*/
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      receiver: req.user._id,
      isRead: false
    },
    {
      $set: {
        isRead: true
      }
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        modifiedCount: result.modifiedCount
      },
      "All notifications marked as read"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/notifications/:notificationId
|--------------------------------------------------------------------------
| Delete one notification owned by logged-in user.
*/
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!isValidMongoId(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await Notification.findByIdAndDelete(notification._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully"));
});