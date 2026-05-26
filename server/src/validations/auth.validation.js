import { z } from "zod";

export const registerValidationSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),

    password: z.string().min(6, "Password must be at least 6 characters long"),

    captchaToken: z.string().trim().min(1, "CAPTCHA verification is required")
  })
};

export const loginValidationSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),

    password: z.string().min(1, "Password is required")
  })
};

export const googleAuthValidationSchema = {
  body: z.object({
    credential: z.string().trim().min(1, "Google credential is required")
  })
};

export const verifyEmailValidationSchema = {
  body: z.object({
    otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code")
  })
};

export const resendVerificationOtpValidationSchema = {
  body: z.object({}).optional()
};

export const linkGoogleAccountValidationSchema = {
  body: z.object({
    credential: z.string().trim().min(1, "Google credential is required")
  })
};

export const changePasswordValidationSchema = {
  body: z.object({
    currentPassword: z.string().optional().default(""),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long")
      .max(128, "New password must not be more than 128 characters"),

    googleCredential: z.string().trim().optional()
  })
};

export const forgotPasswordValidationSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address")
  })
};

export const verifyPasswordResetOtpValidationSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),

    otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code")
  })
};

export const resetPasswordValidationSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),

    resetToken: z.string().trim().min(1, "Password reset token is required"),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long")
      .max(128, "New password must not be more than 128 characters")
  })
};