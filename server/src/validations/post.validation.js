import { z } from "zod";
import { mongoIdSchema } from "./common.validation.js";

export const createPostValidationSchema = {
  body: z.object({
    caption: z
      .string()
      .trim()
      .max(1000, "Caption must not be more than 1000 characters")
      .optional()
      .default(""),

    visibility: z
      .enum(["public", "followers", "private"], {
        message: "Visibility must be public, followers, or private"
      })
      .optional()
      .default("public")
  })
};

export const updatePostValidationSchema = {
  params: z.object({
    postId: mongoIdSchema
  }),

  body: z
    .object({
      caption: z
        .string()
        .trim()
        .max(1000, "Caption must not be more than 1000 characters")
        .optional(),

      visibility: z
        .enum(["public", "followers", "private"], {
          message: "Visibility must be public, followers, or private"
        })
        .optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update"
    })
};

export const postIdParamValidationSchema = {
  params: z.object({
    postId: mongoIdSchema
  })
};

export const usernameParamValidationSchemaForPosts = {
  params: z.object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not be more than 30 characters")
  })
};