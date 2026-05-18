import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAuthTokens } from "../utils/generateTokens.js";
import cookieOptions from "../utils/cookieOptions.js";
import {
  generateOtp,
  hashOtp,
  compareOtp,
  getOtpExpiryDate
} from "../utils/otp.utils.js";
import { sendVerificationOtpEmail } from "../utils/email.service.js";
import { verifyTurnstileToken } from "../utils/turnstile.service.js";
import { verifyGoogleCredential } from "../utils/googleAuth.service.js";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const safeUserSelect =
  "_id name username email bio avatar role status isVerified authProvider profileSetupCompleted interestsSetupCompleted followersCount followingCount createdAt updatedAt";

const privateUserOmitSelect =
  "-password -refreshToken -emailVerificationOtpHash -emailVerificationOtpExpires -emailVerificationOtpAttempts -lastVerificationOtpSentAt -failedLoginAttempts -lockUntil";

const sendAuthResponse = async (res, user, message, statusCode = 200) => {
  const { accessToken, refreshToken } = generateAuthTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, cookieOptions);

  const safeUser = await User.findById(user._id).select(safeUserSelect);

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        user: safeUser,
        accessToken
      },
      message
    )
  );
};

const createAndSendVerificationOtp = async (user) => {
  const otp = generateOtp();

  user.emailVerificationOtpHash = await hashOtp(otp);
  user.emailVerificationOtpExpires = getOtpExpiryDate();
  user.emailVerificationOtpAttempts = 0;
  user.lastVerificationOtpSentAt = new Date();

  await user.save({ validateBeforeSave: false });

  await sendVerificationOtpEmail({
    to: user.email,
    name: user.name,
    otp
  });
};

const makeUsernameBase = (name, email) => {
  const emailName = email.split("@")[0];

  const baseSource = name || emailName;

  const base = baseSource
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (base.length >= 3) {
    return base.slice(0, 24);
  }

  return `user_${emailName}`.replace(/[^a-z0-9_.]/g, "_").slice(0, 24);
};

const generateUniqueUsername = async (name, email) => {
  const baseUsername = makeUsernameBase(name, email);

  let username = baseUsername;
  let exists = await User.findOne({ username }).select("_id");

  while (exists) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    username = `${baseUsername}_${randomNumber}`.slice(0, 30);
    exists = await User.findOne({ username }).select("_id");
  }

  return username;
};

const getTemporaryNameFromEmail = (email) => {
  const emailName = email.split("@")[0];

  if (emailName.length >= 2) {
    return emailName;
  }

  return "New User";
};

const safelyCompleteOldUserFlags = async (user) => {
  if (user.profileSetupCompleted === undefined) {
    user.profileSetupCompleted = Boolean(user.name && user.username);
  }

  if (user.interestsSetupCompleted === undefined) {
    user.interestsSetupCompleted = true;
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, captchaToken } = req.body;

  const isCaptchaValid = await verifyTurnstileToken(captchaToken, req.ip);

  if (!isCaptchaValid) {
    throw new ApiError(400, "CAPTCHA verification failed");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const temporaryName = getTemporaryNameFromEmail(email);
  const temporaryUsername = await generateUniqueUsername(temporaryName, email);

  const user = await User.create({
    name: temporaryName,
    username: temporaryUsername,
    email,
    password,
    authProvider: "local",
    isVerified: false,
    profileSetupCompleted: false,
    interestsSetupCompleted: false
  });

  await createAndSendVerificationOtp(user);

  return sendAuthResponse(
    res,
    user,
    "User registered successfully. Please verify your email using the OTP sent to your inbox.",
    201
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account is suspended");
  }

  if (user.isAccountLocked()) {
    throw new ApiError(
      423,
      "Account is temporarily locked. Please try again later."
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }

    await user.save({ validateBeforeSave: false });

    if (user.lockUntil) {
      throw new ApiError(
        423,
        "Account locked for 15 minutes due to too many failed login attempts"
      );
    }

    throw new ApiError(401, "Invalid email or password");
  }

  await safelyCompleteOldUserFlags(user);

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();

  return sendAuthResponse(res, user, "Login successful", 200);
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  const googleUser = await verifyGoogleCredential(credential);

  if (!googleUser.emailVerified) {
    throw new ApiError(403, "Google email is not verified");
  }

  let user = await User.findOne({
    email: googleUser.email
  }).select("+refreshToken");

  if (!user) {
    const username = await generateUniqueUsername(
      googleUser.name,
      googleUser.email
    );

    user = await User.create({
      name: googleUser.name,
      username,
      email: googleUser.email,
      avatar: googleUser.avatar,
      authProvider: "google",
      providerId: googleUser.providerId,
      isVerified: true,
      profileSetupCompleted: false,
      interestsSetupCompleted: false,
      lastLogin: new Date()
    });

    return sendAuthResponse(res, user, "Google signup successful", 201);
  }

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account is suspended");
  }

  if (user.providerId && user.providerId !== googleUser.providerId) {
    throw new ApiError(
      409,
      "This email is already linked with a different Google account"
    );
  }

  if (!user.providerId) {
    user.providerId = googleUser.providerId;
  }

  if (!user.authProvider) {
    user.authProvider = "local";
  }

  user.isVerified = true;
  user.lastLogin = new Date();

  if (!user.avatar && googleUser.avatar) {
    user.avatar = googleUser.avatar;
  }

  await safelyCompleteOldUserFlags(user);
  await user.save({ validateBeforeSave: false });

  return sendAuthResponse(res, user, "Google login successful", 200);
});

export const logoutUser = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (incomingRefreshToken) {
    await User.findOneAndUpdate(
      {
        refreshToken: incomingRefreshToken
      },
      {
        $set: {
          refreshToken: null
        }
      }
    );
  }

  res.clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logout successful"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(incomingRefreshToken, env.jwtRefreshSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken.userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account is suspended");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or already used");
  }

  await safelyCompleteOldUserFlags(user);

  const { accessToken, refreshToken } = generateAuthTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken
      },
      "Access token refreshed successfully"
    )
  );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(privateUserOmitSelect);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.profileSetupCompleted === undefined) {
    user.profileSetupCompleted = Boolean(user.name && user.username);
  }

  if (user.interestsSetupCompleted === undefined) {
    user.interestsSetupCompleted = true;
  }

  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id).select(safeUserSelect);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: safeUser }, "Current user fetched successfully"));
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const user = await User.findById(req.user._id).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationOtpAttempts"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.authProvider === "local" && user.isVerified) {
    const safeUser = await User.findById(user._id).select(safeUserSelect);

    return res
      .status(200)
      .json(new ApiResponse(200, { user: safeUser }, "Email already verified"));
  }

  if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpires) {
    throw new ApiError(400, "No verification OTP found. Please request a new OTP.");
  }

  if (user.emailVerificationOtpExpires < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new OTP.");
  }

  if (user.emailVerificationOtpAttempts >= env.otpMaxAttempts) {
    throw new ApiError(
      429,
      "Too many invalid OTP attempts. Please request a new OTP."
    );
  }

  const isOtpCorrect = await compareOtp(otp, user.emailVerificationOtpHash);

  if (!isOtpCorrect) {
    user.emailVerificationOtpAttempts += 1;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(400, "Invalid OTP");
  }

  user.isVerified = true;
  user.emailVerificationOtpHash = null;
  user.emailVerificationOtpExpires = null;
  user.emailVerificationOtpAttempts = 0;
  user.lastVerificationOtpSentAt = null;

  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id).select(safeUserSelect);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: safeUser }, "Email verified successfully"));
});

export const resendVerificationOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationOtpAttempts +lastVerificationOtpSentAt"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.authProvider === "local" && user.isVerified) {
    const safeUser = await User.findById(user._id).select(safeUserSelect);

    return res
      .status(200)
      .json(new ApiResponse(200, { user: safeUser }, "Email already verified"));
  }

  if (user.lastVerificationOtpSentAt) {
    const elapsedSeconds =
      (Date.now() - user.lastVerificationOtpSentAt.getTime()) / 1000;

    if (elapsedSeconds < env.otpResendCooldownSeconds) {
      const waitSeconds = Math.ceil(
        env.otpResendCooldownSeconds - elapsedSeconds
      );

      throw new ApiError(
        429,
        `Please wait ${waitSeconds} seconds before requesting another OTP`
      );
    }
  }

  await createAndSendVerificationOtp(user);

  const safeUser = await User.findById(user._id).select(safeUserSelect);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: safeUser
      },
      "Verification OTP sent successfully"
    )
  );
});