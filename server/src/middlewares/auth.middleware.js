import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import Ban from "../models/Ban.model.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| Get Token From Header
|--------------------------------------------------------------------------
*/
const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Check Active Ban
|--------------------------------------------------------------------------
| If ban expired, this automatically deactivates it and restores user status.
*/
const checkUserBanStatus = async (user) => {
  const activeBan = await Ban.findOne({
    user: user._id,
    isActive: true
  }).sort({ createdAt: -1 });

  if (!activeBan) {
    return {
      isBanned: false,
      ban: null
    };
  }

  if (activeBan.expiresAt && activeBan.expiresAt <= new Date()) {
    activeBan.isActive = false;
    await activeBan.save({ validateBeforeSave: false });

    user.status = "active";
    await user.save({ validateBeforeSave: false });

    return {
      isBanned: false,
      ban: null
    };
  }

  return {
    isBanned: true,
    ban: activeBan
  };
};

/*
|--------------------------------------------------------------------------
| Verify JWT
|--------------------------------------------------------------------------
| Normal protected API middleware.
| Blocks banned/suspended users.
*/
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, env.jwtAccessSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decodedToken.userId).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const banStatus = await checkUserBanStatus(user);

  if (banStatus.isBanned || user.status === "banned") {
    throw new ApiError(
      403,
      "Your account is banned. You cannot access this resource."
    );
  }

  if (user.status === "suspended") {
    throw new ApiError(
      403,
      "Your account is suspended. You cannot access this resource."
    );
  }

  req.user = user;
  next();
});

/*
|--------------------------------------------------------------------------
| Verify JWT Allow Banned
|--------------------------------------------------------------------------
| Used only for routes banned users must access, such as submitting appeal.
*/
export const verifyJWTAllowBanned = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, env.jwtAccessSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decodedToken.userId).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (user.status === "suspended") {
    throw new ApiError(
      403,
      "Your account is suspended. You cannot access this resource."
    );
  }

  req.user = user;
  next();
});