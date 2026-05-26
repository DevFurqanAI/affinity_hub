import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import Ban from "../models/Ban.model.js";
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
import {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail
} from "../utils/email.service.js";
import { verifyTurnstileToken } from "../utils/turnstile.service.js";
import { verifyGoogleCredential } from "../utils/googleAuth.service.js";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const safeUserSelect =
  "_id name username email bio avatar role status isVerified authProvider profileSetupCompleted interestsSetupCompleted followersCount followingCount createdAt updatedAt";

const privateUserOmitSelect =
  "-password -refreshToken -emailVerificationOtpHash -emailVerificationOtpExpires -emailVerificationOtpAttempts -lastVerificationOtpSentAt -passwordResetOtpHash -passwordResetOtpExpires -passwordResetOtpAttempts -lastPasswordResetOtpSentAt -passwordResetTokenHash -passwordResetTokenExpires -failedLoginAttempts -lockUntil";

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

const PASSWORD_RESET_GENERIC_MESSAGE =
  "If an eligible account exists for this email, a password reset OTP has been sent.";

const hashPasswordResetToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};

const createAndSendPasswordResetOtp = async (user) => {
  const otp = generateOtp();

  user.passwordResetOtpHash = await hashOtp(otp);
  user.passwordResetOtpExpires = getOtpExpiryDate();
  user.passwordResetOtpAttempts = 0;
  user.lastPasswordResetOtpSentAt = new Date();

  /*
  |--------------------------------------------------------------------------
  | Invalidate Previous Verified Reset Sessions
  |--------------------------------------------------------------------------
  | Requesting a new OTP invalidates any previously issued reset token.
  |--------------------------------------------------------------------------
  */
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpires = null;

  await user.save({ validateBeforeSave: false });

  await sendPasswordResetOtpEmail({
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

const isGoogleConnected = (user) => {
  if (user.googleAccountLinked !== undefined) {
    return user.googleAccountLinked;
  }

  /*
  |--------------------------------------------------------------------------
  | Legacy Compatibility
  |--------------------------------------------------------------------------
  | Before the dedicated flag existed, successful Google auth stored a
  | providerId. Existing Google-created users also have authProvider=google.
  */
  return Boolean(user.providerId) || user.authProvider === "google";
};

const getSecuritySettingsPayload = async (userId) => {
  const user = await User.findById(userId).select(
    "email authProvider providerId googleAccountLinked isVerified status createdAt lastLogin +password"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hasPassword = Boolean(user.password);
  const isGoogleLinked = isGoogleConnected(user);

  return {
    email: user.email,
    authProvider: user.authProvider,
    isVerified: user.isVerified,
    status: user.status,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    hasPassword,
    isGoogleLinked,
    canDisconnectGoogle: isGoogleLinked && hasPassword,
    canCreatePassword: isGoogleLinked && !hasPassword
  };
};

const restoreExpiredBanStatus = async (user) => {
  if (user.status !== "banned") {
    return false;
  }

  const activeBan = await Ban.findOne({
    user: user._id,
    isActive: true
  }).sort({ createdAt: -1 });

  if (!activeBan || !activeBan.expiresAt) {
    return false;
  }

  if (activeBan.expiresAt > new Date()) {
    return false;
  }

  activeBan.isActive = false;
  activeBan.endType = "expired";
  activeBan.endedAt = new Date();

  await activeBan.save({ validateBeforeSave: false });

  const restorableStatuses = ["active", "suspended", "deactivated"];

  user.status = restorableStatuses.includes(activeBan.previousStatus)
    ? activeBan.previousStatus
    : "active";

  await user.save({ validateBeforeSave: false });

  return true;
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
  await restoreExpiredBanStatus(user);

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account is suspended");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();

  if (user.status === "banned") {
    return sendAuthResponse(
      res,
      user,
      "Your account is banned. You may submit an appeal.",
      200
    );
  }

  const wasDeactivated = user.status === "deactivated";

  if (wasDeactivated) {
    user.status = "active";
    user.deactivatedAt = null;
  }

  return sendAuthResponse(
    res,
    user,
    wasDeactivated
      ? "Account reactivated successfully. Welcome back."
      : "Login successful",
    200
  );
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
      googleAccountLinked: true,
      isVerified: true,
      profileSetupCompleted: false,
      interestsSetupCompleted: false,
      lastLogin: new Date()
    });

    return sendAuthResponse(res, user, "Google signup successful", 201);
  }

  await restoreExpiredBanStatus(user);

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account is suspended");
  }

  if (user.googleAccountLinked === false) {
    throw new ApiError(
      403,
      "Google sign-in has been disconnected for this account. Sign in with your password and reconnect Google from Settings."
    );
  }

  if (user.providerId && user.providerId !== googleUser.providerId) {
    throw new ApiError(
      409,
      "This email is already linked with a different Google account"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Banned Account Restriction
  |--------------------------------------------------------------------------
  | A banned local account cannot connect a new Google method while banned.
  | Only an already-linked Google identity can access the appeal screen.
  |--------------------------------------------------------------------------
  */
  if (user.status === "banned" && !user.providerId) {
    throw new ApiError(
      403,
      "Your account is banned. Sign in with email and password to submit an appeal."
    );
  }

  if (!user.providerId) {
    user.providerId = googleUser.providerId;
  }

  user.googleAccountLinked = true;

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

  if (user.status === "banned") {
    return sendAuthResponse(
      res,
      user,
      "Your account is banned. You may submit an appeal.",
      200
    );
  }

  const wasDeactivated = user.status === "deactivated";

  if (wasDeactivated) {
    user.status = "active";
    user.deactivatedAt = null;

    await user.save({ validateBeforeSave: false });
  }

  return sendAuthResponse(
    res,
    user,
    wasDeactivated
      ? "Account reactivated successfully. Welcome back."
      : "Google login successful",
    200
  );
});

export const getSecuritySettings = asyncHandler(async (req, res) => {
  const security = await getSecuritySettingsPayload(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        security
      },
      "Security settings fetched successfully"
    )
  );
});

export const linkGoogleAccount = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  const currentUser = await User.findById(req.user._id).select(
    "+password +refreshToken"
  );

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const googleUser = await verifyGoogleCredential(credential);

  if (!googleUser.emailVerified) {
    throw new ApiError(403, "Google email is not verified");
  }

  if (googleUser.email.toLowerCase() !== currentUser.email.toLowerCase()) {
    throw new ApiError(
      409,
      "Please use the Google account with the same email address as your Affinity Hub account"
    );
  }

  const linkedToAnotherUser = await User.findOne({
    _id: {
      $ne: currentUser._id
    },
    providerId: googleUser.providerId,
    googleAccountLinked: {
      $ne: false
    }
  }).select("_id");

  if (linkedToAnotherUser) {
    throw new ApiError(
      409,
      "This Google account is already linked to another Affinity Hub account"
    );
  }

  if (
    currentUser.providerId &&
    currentUser.providerId !== googleUser.providerId &&
    isGoogleConnected(currentUser)
  ) {
    throw new ApiError(
      409,
      "A different Google account is already linked to this account"
    );
  }

  currentUser.providerId = googleUser.providerId;
  currentUser.googleAccountLinked = true;

  await currentUser.save({ validateBeforeSave: false });

  const security = await getSecuritySettingsPayload(currentUser._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        security
      },
      "Google account connected successfully"
    )
  );
});

export const unlinkGoogleAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!isGoogleConnected(user)) {
    throw new ApiError(409, "Google account is not connected");
  }

  if (!user.password) {
    throw new ApiError(
      400,
      "Create a password before disconnecting your only sign-in method"
    );
  }

  user.providerId = null;
  user.googleAccountLinked = false;

  /*
  |--------------------------------------------------------------------------
  | Google-only Account Converted to Local Login
  |--------------------------------------------------------------------------
  | Once a Google-created account has a password and disconnects Google,
  | email/password becomes its available authentication method.
  */
  if (user.authProvider === "google") {
    user.authProvider = "local";
  }

  await user.save({ validateBeforeSave: false });

  const security = await getSecuritySettingsPayload(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        security
      },
      "Google account disconnected successfully"
    )
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const {
    currentPassword = "",
    newPassword,
    googleCredential
  } = req.body;

  const user = await User.findById(req.user._id).select(
    "+password +refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hasExistingPassword = Boolean(user.password);

  if (hasExistingPassword) {
    if (!currentPassword) {
      throw new ApiError(400, "Current password is required");
    }

    const isCurrentPasswordCorrect = await user.comparePassword(
      currentPassword
    );

    if (!isCurrentPasswordCorrect) {
      throw new ApiError(401, "Current password is incorrect");
    }
  } else {
    if (!isGoogleConnected(user)) {
      throw new ApiError(
        400,
        "A connected Google account is required to create a password"
      );
    }

    if (!googleCredential) {
      throw new ApiError(
        400,
        "Verify your Google account before creating a password"
      );
    }

    const googleUser = await verifyGoogleCredential(googleCredential);

    if (!googleUser.emailVerified) {
      throw new ApiError(403, "Google email is not verified");
    }

    if (
      googleUser.email.toLowerCase() !== user.email.toLowerCase() ||
      googleUser.providerId !== user.providerId
    ) {
      throw new ApiError(
        403,
        "Google verification does not match your connected account"
      );
    }
  }

  user.password = newPassword;

  await user.save();

  /*
  |--------------------------------------------------------------------------
  | Rotate Auth Tokens After Password Update
  |--------------------------------------------------------------------------
  | This keeps the active Settings session usable while invalidating the
  | previous stored refresh token.
  */
  const { accessToken, refreshToken } = generateAuthTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, cookieOptions);

  const security = await getSecuritySettingsPayload(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        security,
        accessToken
      },
      hasExistingPassword
        ? "Password changed successfully"
        : "Password created successfully"
    )
  );
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

  await restoreExpiredBanStatus(user);

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account is suspended");
  }

  if (user.status === "deactivated") {
    throw new ApiError(
      403,
      "Your account is deactivated. Sign in again to reactivate it."
    );
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

/*
|--------------------------------------------------------------------------
| POST /api/auth/forgot-password
|--------------------------------------------------------------------------
| Public route. Sends OTP only for eligible password-based accounts.
| Response is intentionally generic to avoid exposing registered emails.
|--------------------------------------------------------------------------
*/
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email
  }).select("+password +lastPasswordResetOtpSentAt");

  /*
  |--------------------------------------------------------------------------
  | Eligible Accounts
  |--------------------------------------------------------------------------
  | - Must exist
  | - Must already have password sign-in available
  | - Local unverified users should complete original email verification
  |   instead of starting password recovery.
  |--------------------------------------------------------------------------
  */
  if (!user || !user.password || !user.isVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, PASSWORD_RESET_GENERIC_MESSAGE));
  }

  if (user.lastPasswordResetOtpSentAt) {
    const elapsedSeconds =
      (Date.now() - user.lastPasswordResetOtpSentAt.getTime()) / 1000;

    /*
    |--------------------------------------------------------------------------
    | Quiet Cooldown
    |--------------------------------------------------------------------------
    | Do not reveal whether a registered account exists by changing the
    | response message during resend cooldown.
    |--------------------------------------------------------------------------
    */
    if (elapsedSeconds < env.otpResendCooldownSeconds) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, PASSWORD_RESET_GENERIC_MESSAGE));
    }
  }

  await createAndSendPasswordResetOtp(user);

  return res
    .status(200)
    .json(new ApiResponse(200, null, PASSWORD_RESET_GENERIC_MESSAGE));
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/verify-reset-otp
|--------------------------------------------------------------------------
| Public route. Valid OTP returns a one-time reset token.
|--------------------------------------------------------------------------
*/
export const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email
  }).select(
    "+password +passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts"
  );

  if (
    !user ||
    !user.password ||
    !user.passwordResetOtpHash ||
    !user.passwordResetOtpExpires
  ) {
    throw new ApiError(400, "Invalid or expired password reset OTP");
  }

  if (user.passwordResetOtpExpires < new Date()) {
    throw new ApiError(
      400,
      "Password reset OTP has expired. Please request a new OTP."
    );
  }

  if (user.passwordResetOtpAttempts >= env.otpMaxAttempts) {
    throw new ApiError(
      429,
      "Too many invalid OTP attempts. Please request a new OTP."
    );
  }

  const isOtpCorrect = await compareOtp(otp, user.passwordResetOtpHash);

  if (!isOtpCorrect) {
    user.passwordResetOtpAttempts += 1;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(400, "Invalid password reset OTP");
  }

  const resetToken = randomBytes(32).toString("hex");

  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpires = null;
  user.passwordResetOtpAttempts = 0;
  user.passwordResetTokenHash = hashPasswordResetToken(resetToken);
  user.passwordResetTokenExpires = getOtpExpiryDate();

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resetToken
      },
      "OTP verified successfully. You may now set a new password."
    )
  );
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/reset-password
|--------------------------------------------------------------------------
| Public route. Consumes one-time reset token and invalidates refresh session.
|--------------------------------------------------------------------------
*/
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  const user = await User.findOne({
    email
  }).select(
    "+passwordResetTokenHash +passwordResetTokenExpires +refreshToken"
  );

  if (
    !user ||
    !user.passwordResetTokenHash ||
    !user.passwordResetTokenExpires
  ) {
    throw new ApiError(400, "Password reset session is invalid or expired");
  }

  if (user.passwordResetTokenExpires < new Date()) {
    throw new ApiError(
      400,
      "Password reset session has expired. Please request a new OTP."
    );
  }

  const incomingTokenHash = hashPasswordResetToken(resetToken);

  if (incomingTokenHash !== user.passwordResetTokenHash) {
    throw new ApiError(400, "Password reset session is invalid or expired");
  }

  user.password = newPassword;

  /*
  |--------------------------------------------------------------------------
  | Clear Security State
  |--------------------------------------------------------------------------
  | Status is intentionally not changed here:
  | - banned stays banned
  | - suspended stays suspended
  | - deactivated reactivates only after successful future login
  |--------------------------------------------------------------------------
  */
  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpires = null;
  user.passwordResetOtpAttempts = 0;
  user.lastPasswordResetOtpSentAt = null;
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpires = null;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.refreshToken = null;

  await user.save();

  res.clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully. Please sign in."));
});