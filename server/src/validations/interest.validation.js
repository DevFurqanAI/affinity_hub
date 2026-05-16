import { z } from "zod";
import { mongoIdSchema } from "./common.validation.js";

export const setUserInterestsValidationSchema = {
  body: z.object({
    interestIds: z
      .array(mongoIdSchema)
      .min(1, "Please select at least one interest")
      .max(20, "You can select maximum 20 interests")
  })
};

export const setPostInterestsValidationSchema = {
  params: z.object({
    postId: mongoIdSchema
  }),

  body: z.object({
    interestIds: z
      .array(mongoIdSchema)
      .min(1, "Please select at least one interest")
      .max(10, "A post can have maximum 10 interests")
  })
};

export const recommendationQueryValidationSchema = {
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