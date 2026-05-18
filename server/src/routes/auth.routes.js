import { Router } from "express";

import validate from "../middlewares/validate.middleware.js";
import { verifyJWTAllowUnverified } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  verifyEmailOtp,
  resendVerificationOtp
} from "../controllers/auth.controller.js";
import {
  registerValidationSchema,
  loginValidationSchema,
  googleAuthValidationSchema,
  verifyEmailValidationSchema,
  resendVerificationOtpValidationSchema
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

/*
|--------------------------------------------------------------------------
| Authenticated but Unverified-Allowed Routes
|--------------------------------------------------------------------------
| These routes must allow local unverified users because they need them for:
| - checking current auth state
| - verifying email OTP
| - resending OTP
*/
router.get("/me", verifyJWTAllowUnverified, getCurrentUser);

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

export default router;