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