import { z } from "zod";

export const updateProfileValidationSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(60, "Name must not be more than 60 characters")
      .optional(),

    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not be more than 30 characters")
      .regex(
        /^[a-z0-9_.]+$/,
        "Username can only contain lowercase letters, numbers, underscore, and dot"
      )
      .optional(),

    bio: z
      .string()
      .trim()
      .max(250, "Bio must not be more than 250 characters")
      .optional()
  })
};

export const completeProfileValidationSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Display name must be at least 2 characters long")
      .max(60, "Display name must not be more than 60 characters"),

    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not be more than 30 characters")
      .regex(
        /^[a-z0-9_.]+$/,
        "Username can only contain lowercase letters, numbers, underscore, and dot"
      ),

    bio: z
      .string()
      .trim()
      .max(250, "Bio must not be more than 250 characters")
      .optional()
      .default("")
  })
};