import { z } from "zod";
import { mongoIdSchema } from "./common.validation.js";

const paginationQueryFields = {
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
};

export const getAdminUsersValidationSchema = {
  query: z.object({
    ...paginationQueryFields,

    q: z.string().trim().max(100, "Search term is too long").optional(),

    status: z
      .union([
        z.literal(""),
        z.enum(["active", "banned", "suspended", "deactivated"])
      ])
      .optional(),

    role: z.union([z.literal(""), z.enum(["user", "admin"])]).optional()
  })
};

export const getAdminBansValidationSchema = {
  query: z.object({
    ...paginationQueryFields,

    state: z
      .union([z.literal(""), z.enum(["all", "active", "ended"])])
      .optional()
  })
};

export const suspendAdminUserValidationSchema = {
  params: z.object({
    userId: mongoIdSchema
  }),

  body: z.object({
    reason: z
      .string()
      .trim()
      .min(5, "Suspension reason must be at least 5 characters long")
      .max(500, "Suspension reason must not be more than 500 characters")
  })
};

export const restoreAdminUserValidationSchema = {
  params: z.object({
    userId: mongoIdSchema
  })
};