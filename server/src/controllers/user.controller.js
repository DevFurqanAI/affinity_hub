import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cookieOptions from "../utils/cookieOptions.js";
import { hasBlockRelation } from "../utils/block.helpers.js";
import { addStoryStatusToUsers } from "../utils/storyStatus.helpers.js";

const safeUserSelect =
  "_id name username email bio avatar role status isVerified authProvider profileSetupCompleted interestsSetupCompleted followersCount followingCount createdAt updatedAt";

const publicUserSelect =
  "_id name username bio avatar role status isVerified authProvider profileSetupCompleted interestsSetupCompleted followersCount followingCount createdAt updatedAt";

const addStoryStatusToUser = async (user, viewerId) => {
  const [userWithStoryStatus] = await addStoryStatusToUsers(
    [user],
    viewerId
  );

  return userWithStoryStatus;
};

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

  const userWithStoryStatus = await addStoryStatusToUser(
    user,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userWithStoryStatus
      },
      "Profile fetched successfully"
    )
  );
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

  const userWithStoryStatus = await addStoryStatusToUser(
    updatedUser,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userWithStoryStatus
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

  const userWithStoryStatus = await addStoryStatusToUser(
    updatedUser,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userWithStoryStatus
      },
      "Profile updated successfully"
    )
  );
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

  const userWithStoryStatus = await addStoryStatusToUser(
    user,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userWithStoryStatus
      },
      "User profile fetched successfully"
    )
  );
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

  const userWithStoryStatus = await addStoryStatusToUser(
    updatedUser,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userWithStoryStatus
      },
      "Avatar updated successfully"
    )
  );
});

export const deactivateAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (typeof password !== "string" || !password.trim()) {
    throw new ApiError(400, "Password is required to deactivate your account");
  }

  const user = await User.findById(req.user._id).select(
    "+password +refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.status !== "active") {
    throw new ApiError(400, "Only an active account can be deactivated");
  }

  if (!user.password) {
    throw new ApiError(
      400,
      "Create a password in Account & Security before deactivating your account"
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  user.status = "deactivated";
  user.deactivatedAt = new Date();
  user.refreshToken = null;

  await user.save({ validateBeforeSave: false });

  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Account deactivated successfully. Sign in again whenever you want to reactivate it."
    )
  );
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.avatar = "";

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user
      },
      "Profile photo removed successfully"
    )
  );
});