import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const safeUserSelect = "-password -refreshToken";

const getSafeUserObject = (user) => {
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.refreshToken;

  return userObject;
};

/*
|--------------------------------------------------------------------------
| Check Cloudinary Config
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| Upload Buffer To Cloudinary
|--------------------------------------------------------------------------
*/
const uploadBufferToCloudinary = (fileBuffer) => {
  checkCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinaryFolder}/avatars`,
        resource_type: "image",
        timeout: 60000,
        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face"
          }
        ]
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

/*
|--------------------------------------------------------------------------
| GET /api/users/me
|--------------------------------------------------------------------------
*/
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(safeUserSelect);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile fetched successfully"));
});

/*
|--------------------------------------------------------------------------
| PATCH /api/users/me
|--------------------------------------------------------------------------
*/
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, username, bio } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (username && username !== user.username) {
    const usernameExists = await User.findOne({
      username,
      _id: {
        $ne: user._id
      }
    });

    if (usernameExists) {
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

  const safeUser = getSafeUserObject(user);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: safeUser }, "Profile updated successfully")
    );
});

/*
|--------------------------------------------------------------------------
| GET /api/users/:username
|--------------------------------------------------------------------------
*/
export const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select(safeUserSelect);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile fetched successfully"));
});

/*
|--------------------------------------------------------------------------
| PATCH /api/users/me/avatar
|--------------------------------------------------------------------------
*/
export const updateMyAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image is required");
  }

  let uploadedImage;

  try {
    uploadedImage = await uploadBufferToCloudinary(req.file.buffer);
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    throw new ApiError(
      500,
      "Avatar upload failed. Please check Cloudinary credentials or internet connection."
    );
  }

  if (!uploadedImage?.secure_url) {
    throw new ApiError(500, "Avatar upload failed. No image URL received.");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: uploadedImage.secure_url
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).select(safeUserSelect);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Avatar updated successfully"));
});