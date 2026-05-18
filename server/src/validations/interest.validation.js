import { z } from "zod";
import { mongoIdSchema } from "./common.validation.js";

export const setUserInterestsValidationSchema = {
  body: z.object({
    interestIds: z
      .array(mongoIdSchema)
      .min(3, "Please select at least 3 interests")
      .max(10, "You can select up to 10 interests")
  })
};

export const setPostInterestsValidationSchema = {
  params: z.object({
    postId: mongoIdSchema
  }),

  body: z.object({
    interestIds: z
      .array(mongoIdSchema)
      .min(1, "Please select at least 1 interest")
      .max(10, "You can select up to 10 interests")
  })
};