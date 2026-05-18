import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hasBlockRelation } from "../utils/block.helpers.js";

const safeUserSelect =
  "_id name username email bio avatar role status isVerified authProvider profileSetupCompleted interestsSetupCompleted followersCount followingCount createdAt updatedAt";

const publicUserSelect =
  "_id name username bio avatar role status isVerified authProvider profileSetupCompleted interestsSetupCompleted followersCount followingCount createdAt updatedAt";

const uploadBufferToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinaryFolder}/avatars`,
        resource_type: "image"
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

export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(safeUserSelect);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile fetched successfully"));
});

export const completeProfile = asyncHandler(async (req, res) => {
  const { name, username, bio = "" } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingUsername = await User.findOne({
    username,
    _id: {
      $ne: user._id
    }
  });

  if (existingUsername) {
    throw new ApiError(409, "Username is already taken");
  }

  user.name = name;
  user.username = username;
  user.bio = bio;
  user.profileSetupCompleted = true;

  await user.save();

  const updatedUser = await User.findById(user._id).select(safeUserSelect);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser
      },
      "Profile completed successfully"
    )
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, bio } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (username && username !== user.username) {
    const existingUsername = await User.findOne({
      username,
      _id: {
        $ne: user._id
      }
    });

    if (existingUsername) {
      throw new ApiError(409, "Username is already taken");
    }

    user.username = username;
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select(safeUserSelect);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({
    username,
    status: "active"
  }).select(publicUserSelect);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isOwnProfile = user._id.toString() === req.user._id.toString();

  if (!isOwnProfile) {
    const isBlocked = await hasBlockRelation(req.user._id, user._id);

    if (isBlocked) {
      throw new ApiError(403, "You cannot view this profile");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile fetched successfully"));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const uploadedAvatar = await uploadBufferToCloudinary(req.file.buffer);

  user.avatar = uploadedAvatar.secure_url;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(safeUserSelect);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser
      },
      "Avatar updated successfully"
    )
  );
});