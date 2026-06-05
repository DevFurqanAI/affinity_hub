import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import {
  getCurrentUserProfile,
  completeProfile,
  updateProfile,
  getUserProfile,
  updateAvatar,
  removeAvatar,
  deactivateAccount
} from "../controllers/user.controller.js";
import {
  completeProfileValidationSchema,
  updateProfileValidationSchema
} from "../validations/user.validation.js";

const router = Router();

router.get("/me", verifyJWT, getCurrentUserProfile);

router.patch(
  "/me/complete-profile",
  verifyJWT,
  validate(completeProfileValidationSchema),
  completeProfile
);

router.patch(
  "/me",
  verifyJWT,
  validate(updateProfileValidationSchema),
  updateProfile
);

router.patch("/me/avatar", verifyJWT, uploadAvatar, updateAvatar);

router.delete("/me/avatar", verifyJWT, removeAvatar);

router.patch("/me/deactivate", verifyJWT, deactivateAccount);

router.get("/:username", verifyJWT, getUserProfile);

export default router;