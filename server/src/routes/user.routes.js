import { Router } from "express";

import validate from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  getMyProfile,
  updateMyProfile,
  getUserByUsername,
  updateMyAvatar
} from "../controllers/user.controller.js";
import {
  updateProfileValidationSchema,
  usernameParamValidationSchema
} from "../validations/user.validation.js";

const router = Router();

router.get("/me", verifyJWT, getMyProfile);

router.patch(
  "/me",
  verifyJWT,
  validate(updateProfileValidationSchema),
  updateMyProfile
);

router.patch("/me/avatar", verifyJWT, uploadAvatar, updateMyAvatar);

router.get(
  "/:username",
  validate(usernameParamValidationSchema),
  getUserByUsername
);

export default router;