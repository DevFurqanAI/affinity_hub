import { z } from "zod";
import { mongoIdSchema } from "./common.validation.js";

export const banUserValidationSchema = {
  params: z.object({
    userId: mongoIdSchema
  }),

  body: z.object({
    reason: z
      .string()
      .trim()
      .min(5, "Ban reason must be at least 5 characters long")
      .max(500, "Ban reason must not be more than 500 characters"),

    expiresAt: z
      .string()
      .datetime("expiresAt must be a valid date-time")
      .optional()
      .nullable()
  })
};

export const removeBanValidationSchema = {
  params: z.object({
    banId: mongoIdSchema
  })
};

export const submitAppealValidationSchema = {
  params: z.object({
    banId: mongoIdSchema
  }),

  body: z.object({
    message: z
      .string()
      .trim()
      .min(10, "Appeal message must be at least 10 characters long")
      .max(1000, "Appeal message must not be more than 1000 characters")
  })
};

export const getAppealsValidationSchema = {
  query: z.object({
    status: z.enum(["pending", "accepted", "rejected"]).optional(),

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

export const reviewAppealValidationSchema = {
  params: z.object({
    appealId: mongoIdSchema
  }),

  body: z.object({
    status: z.enum(["accepted", "rejected"], {
      message: "Appeal status must be accepted or rejected"
    }),

    unbanUser: z.boolean().optional().default(true)
  })
};