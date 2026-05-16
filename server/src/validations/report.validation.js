import { z } from "zod";
import { mongoIdSchema } from "./common.validation.js";

export const createReportValidationSchema = {
  body: z.object({
    targetId: mongoIdSchema,

    targetType: z.enum(["user", "post", "comment", "story"], {
      message: "Target type must be user, post, comment, or story"
    }),

    reason: z
      .string()
      .trim()
      .min(5, "Reason must be at least 5 characters long")
      .max(500, "Reason must not be more than 500 characters")
  })
};

export const updateReportStatusValidationSchema = {
  params: z.object({
    reportId: mongoIdSchema
  }),

  body: z.object({
    status: z.enum(["pending", "reviewed", "rejected", "action_taken"], {
      message:
        "Status must be pending, reviewed, rejected, or action_taken"
    })
  })
};

export const reportIdParamValidationSchema = {
  params: z.object({
    reportId: mongoIdSchema
  })
};

export const getReportsQueryValidationSchema = {
  query: z.object({
    status: z
      .enum(["pending", "reviewed", "rejected", "action_taken"])
      .optional(),

    targetType: z.enum(["user", "post", "comment", "story"]).optional(),

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