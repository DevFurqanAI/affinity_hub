import { z } from "zod";

export const updateProfileValidationSchema = {
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must not be more than 50 characters")
        .optional(),

      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must not be more than 30 characters")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username can only contain letters, numbers, and underscores"
        )
        .optional(),

      bio: z
        .string()
        .trim()
        .max(250, "Bio must not be more than 250 characters")
        .optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update"
    })
};

export const usernameParamValidationSchema = {
  params: z.object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not be more than 30 characters")
  })
};