import { Router } from "express";

import {
  verifyJWT,
  verifyJWTAllowBanned
} from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  banUser,
  removeBan,
  submitAppeal,
  getAppeals,
  reviewAppeal
} from "../controllers/ban.controller.js";
import {
  banUserValidationSchema,
  removeBanValidationSchema,
  submitAppealValidationSchema,
  getAppealsValidationSchema,
  reviewAppealValidationSchema
} from "../validations/ban.validation.js";

const router = Router();

router.post(
  "/:userId",
  verifyJWT,
  verifyAdmin,
  validate(banUserValidationSchema),
  banUser
);

router.patch(
  "/:banId/remove",
  verifyJWT,
  verifyAdmin,
  validate(removeBanValidationSchema),
  removeBan
);

/*
|--------------------------------------------------------------------------
| Appeal Route
|--------------------------------------------------------------------------
| Banned users must still be able to submit appeal.
| So this route uses verifyJWTAllowBanned instead of verifyJWT.
*/
router.post(
  "/:banId/appeal",
  verifyJWTAllowBanned,
  validate(submitAppealValidationSchema),
  submitAppeal
);

router.get(
  "/appeals",
  verifyJWT,
  verifyAdmin,
  validate(getAppealsValidationSchema),
  getAppeals
);

router.patch(
  "/appeals/:appealId",
  verifyJWT,
  verifyAdmin,
  validate(reviewAppealValidationSchema),
  reviewAppeal
);

export default router;