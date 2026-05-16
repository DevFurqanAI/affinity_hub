import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Register Validation
|--------------------------------------------------------------------------
*/
export const registerValidationSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must not be more than 50 characters"),

    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not be more than 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters long")
  })
};

/*
|--------------------------------------------------------------------------
| Login Validation
|--------------------------------------------------------------------------
*/
export const loginValidationSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
  })
};

/*
|--------------------------------------------------------------------------
| Refresh Token Validation
|--------------------------------------------------------------------------
| Later, refresh token will come from HTTP-only cookies.
| For now, this schema is ready if we need to validate cookie data.
*/
export const refreshTokenValidationSchema = {
  cookies: z.object({
    refreshToken: z
      .string()
      .min(1, "Refresh token is required")
  })
};