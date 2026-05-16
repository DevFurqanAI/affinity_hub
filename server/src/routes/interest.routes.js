import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  getAllInterests,
  setMyInterests,
  getMyInterests,
  setPostInterests,
  getRecommendedUsers,
  getRecommendedPosts
} from "../controllers/interest.controller.js";
import {
  setUserInterestsValidationSchema,
  setPostInterestsValidationSchema,
  recommendationQueryValidationSchema
} from "../validations/interest.validation.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getAllInterests);

router.post("/user", validate(setUserInterestsValidationSchema), setMyInterests);

router.get("/user/me", getMyInterests);

router.post(
  "/post/:postId",
  validate(setPostInterestsValidationSchema),
  setPostInterests
);

router.get(
  "/recommended-users",
  validate(recommendationQueryValidationSchema),
  getRecommendedUsers
);

router.get(
  "/recommended-posts",
  validate(recommendationQueryValidationSchema),
  getRecommendedPosts
);

export default router;