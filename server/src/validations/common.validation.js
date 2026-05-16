import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Validation Schemas
|--------------------------------------------------------------------------
| These schemas can be reused later in auth, posts, comments, profiles, etc.
| For now, they are only used by the temporary test route.
*/

export const mongoIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB id");

export const paginationQuerySchema = z.object({
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
    .refine((value) => Number.isInteger(value) && value > 0 && value <= 100, {
      message: "Limit must be between 1 and 100"
    })
});

export const testValidationSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must not be more than 50 characters"),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email address"),

    age: z
      .number({
        required_error: "Age is required",
        invalid_type_error: "Age must be a number"
      })
      .int("Age must be a whole number")
      .min(13, "Age must be at least 13")
      .max(120, "Age must not be more than 120")
  }),

  params: z.object({
    id: mongoIdSchema
  }),

  query: paginationQuerySchema
};