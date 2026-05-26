import { Router } from "express";

import validate from "../middlewares/validate.middleware.js";
import {
  verifyJWT,
  verifyJWTAllowUnverified,
  verifyJWTAllowBanned
} from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  verifyEmailOtp,
  resendVerificationOtp,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
  getSecuritySettings,
  linkGoogleAccount,
  unlinkGoogleAccount,
  changePassword
} from "../controllers/auth.controller.js";
import {
  registerValidationSchema,
  loginValidationSchema,
  googleAuthValidationSchema,
  verifyEmailValidationSchema,
  resendVerificationOtpValidationSchema,
  forgotPasswordValidationSchema,
  verifyPasswordResetOtpValidationSchema,
  resetPasswordValidationSchema,
  linkGoogleAccountValidationSchema,
  changePasswordValidationSchema
} from "../validations/auth.validation.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Auth Routes
|--------------------------------------------------------------------------
| These routes must NOT require auth middleware.
*/
router.post("/register", validate(registerValidationSchema), registerUser);

router.post("/login", validate(loginValidationSchema), loginUser);

router.post("/google", validate(googleAuthValidationSchema), googleAuth);

router.post("/logout", logoutUser);

router.post("/refresh", refreshAccessToken);

router.post(
  "/forgot-password",
  validate(forgotPasswordValidationSchema),
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  validate(verifyPasswordResetOtpValidationSchema),
  verifyPasswordResetOtp
);

router.post(
  "/reset-password",
  validate(resetPasswordValidationSchema),
  resetPassword
);

/*
|--------------------------------------------------------------------------
| Authenticated but Unverified-Allowed Routes
|--------------------------------------------------------------------------
| These routes must allow local unverified users because they need them for:
| - checking current auth state
| - verifying email OTP
| - resending OTP
*/
router.get("/me", verifyJWTAllowBanned, getCurrentUser);

router.post(
  "/verify-email",
  verifyJWTAllowUnverified,
  validate(verifyEmailValidationSchema),
  verifyEmailOtp
);

router.post(
  "/resend-verification-otp",
  verifyJWTAllowUnverified,
  validate(resendVerificationOtpValidationSchema),
  resendVerificationOtp
);

/*
|--------------------------------------------------------------------------
| Authenticated Account Security Routes
|--------------------------------------------------------------------------
| These endpoints are used from Settings after normal onboarding and
| verification are complete.
*/
router.get("/security-settings", verifyJWT, getSecuritySettings);

router.post(
  "/link/google",
  verifyJWT,
  validate(linkGoogleAccountValidationSchema),
  linkGoogleAccount
);

router.delete("/link/google", verifyJWT, unlinkGoogleAccount);

router.patch(
  "/password",
  verifyJWT,
  validate(changePasswordValidationSchema),
  changePassword
);

export default router;