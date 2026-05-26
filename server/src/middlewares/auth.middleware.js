import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import Ban from "../models/Ban.model.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

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
    activeBan.endType = "expired";
    activeBan.endedAt = new Date();

    await activeBan.save({ validateBeforeSave: false });

    if (user.status === "banned") {
      const restorableStatuses = ["active", "suspended", "deactivated"];

      user.status = restorableStatuses.includes(activeBan.previousStatus)
        ? activeBan.previousStatus
        : "active";

      await user.save({ validateBeforeSave: false });
    }

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

const getUserFromAccessToken = async (req) => {
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

  return user;
};

const isLocalUnverifiedUser = (user) => {
  return user.authProvider === "local" && user.isVerified === false;
};

const rejectDeactivatedAccount = (user) => {
  if (user.status === "deactivated") {
    throw new ApiError(
      403,
      "Your account is deactivated. Sign in again to reactivate it."
    );
  }
};

/*
|--------------------------------------------------------------------------
| Normal Protected API Middleware
|--------------------------------------------------------------------------
| Blocks:
| - banned users
| - suspended users
| - deactivated users
| - local unverified users
|
| Does NOT block:
| - profileSetupCompleted === false
| - interestsSetupCompleted === false
|
| Onboarding redirects are handled by frontend route guards.
|--------------------------------------------------------------------------
*/
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const user = await getUserFromAccessToken(req);

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

  rejectDeactivatedAccount(user);

  if (isLocalUnverifiedUser(user)) {
    throw new ApiError(
      403,
      "Please verify your email before accessing this resource."
    );
  }

  req.user = user;
  next();
});

/*
|--------------------------------------------------------------------------
| Unverified-Allowed Middleware
|--------------------------------------------------------------------------
| Allows:
| - local unverified users for verification flow
|
| Blocks:
| - banned users
| - suspended users
| - deactivated users
|
| Deactivated accounts are restored only through a successful login.
|--------------------------------------------------------------------------
*/
export const verifyJWTAllowUnverified = asyncHandler(
  async (req, res, next) => {
    const user = await getUserFromAccessToken(req);

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

    rejectDeactivatedAccount(user);

    req.user = user;
    next();
  }
);

/*
|--------------------------------------------------------------------------
| Banned-Allowed Middleware
|--------------------------------------------------------------------------
| Allows:
| - banned users, for appeal route only
|
| Blocks:
| - suspended users
| - deactivated users
|--------------------------------------------------------------------------
*/
export const verifyJWTAllowBanned = asyncHandler(async (req, res, next) => {
  const user = await getUserFromAccessToken(req);

  if (user.status === "suspended") {
    throw new ApiError(
      403,
      "Your account is suspended. You cannot access this resource."
    );
  }

  rejectDeactivatedAccount(user);

  req.user = user;
  next();
});