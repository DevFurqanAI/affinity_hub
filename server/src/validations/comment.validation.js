import { z } from "zod";
import { mongoIdSchema } from "./common.validation.js";

export const createCommentValidationSchema = {
  params: z.object({
    postId: mongoIdSchema
  }),

  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Comment cannot be empty")
      .max(500, "Comment must not be more than 500 characters")
  })
};

export const getCommentsValidationSchema = {
  params: z.object({
    postId: mongoIdSchema
  }),

  query: z.object({
    page: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value) : 1))
      .refine((value) => Number.isInteger(value) && value > 0, {
        message: "Page must be a positive number"
      }),

    limit: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value) : 10))
      .refine((value) => Number.isInteger(value) && value > 0 && value <= 50, {
        message: "Limit must be between 1 and 50"
      })
  })
};

export const updateCommentValidationSchema = {
  params: z.object({
    commentId: mongoIdSchema
  }),

  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, "Comment cannot be empty")
      .max(500, "Comment must not be more than 500 characters")
  })
};

export const deleteCommentValidationSchema = {
  params: z.object({
    commentId: mongoIdSchema
  })
};