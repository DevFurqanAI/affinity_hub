import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAuthTokens,
  generateAccessToken,
  generateRefreshToken
} from "../utils/generateTokens.js";
import cookieOptions from "../utils/cookieOptions.js";
import env from "../config/env.js";

const getSafeUser = (user) => {
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.refreshToken;

  return userObject;
};

/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/
export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, "Email is already registered");
    }

    if (existingUser.username === username) {
      throw new ApiError(409, "Username is already taken");
    }
  }

  const user = await User.create({
    name,
    username,
    email,
    password
  });

  const { accessToken, refreshToken } = generateAuthTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const safeUser = getSafeUser(user);

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        {
          user: safeUser,
          accessToken
        },
        "User registered successfully"
      )
    );
});

/*
|--------------------------------------------------------------------------
| Login User
|--------------------------------------------------------------------------
*/
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isAccountLocked()) {
    throw new ApiError(423, "Account is temporarily locked");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Your account is not active");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    user.failedLoginAttempts += 1;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = generateAuthTokens(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  await user.save({ validateBeforeSave: false });

  const safeUser = getSafeUser(user);

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          accessToken
        },
        "User logged in successfully"
      )
    );
});

/*
|--------------------------------------------------------------------------
| Logout User
|--------------------------------------------------------------------------
*/
export const logoutUser = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (incomingRefreshToken) {
    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        env.jwtRefreshSecret
      );

      await User.findByIdAndUpdate(decodedToken.userId, {
        $set: {
          refreshToken: null
        }
      });
    } catch {
      // Even if token is invalid, still clear cookie from browser
    }
  }

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
*/
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const decodedToken = jwt.verify(incomingRefreshToken, env.jwtRefreshSecret);

  const user = await User.findById(decodedToken.userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or already used");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Your account is not active");
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken
        },
        "Access token refreshed successfully"
      )
    );
});

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, "Current user fetched"));
});