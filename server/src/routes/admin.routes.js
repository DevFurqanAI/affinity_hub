import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  getAdminStats,
  getAdminUsers,
  getAdminBans,
  suspendUser,
  restoreSuspendedUser
} from "../controllers/admin.controller.js";
import {
  getAdminUsersValidationSchema,
  getAdminBansValidationSchema,
  suspendAdminUserValidationSchema,
  restoreAdminUserValidationSchema
} from "../validations/admin.validation.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.get("/stats", getAdminStats);

router.get(
  "/users",
  validate(getAdminUsersValidationSchema),
  getAdminUsers
);

router.patch(
  "/users/:userId/suspend",
  validate(suspendAdminUserValidationSchema),
  suspendUser
);

router.patch(
  "/users/:userId/restore",
  validate(restoreAdminUserValidationSchema),
  restoreSuspendedUser
);

router.get(
  "/bans",
  validate(getAdminBansValidationSchema),
  getAdminBans
);

export default router;