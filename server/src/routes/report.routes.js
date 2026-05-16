import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReport
} from "../controllers/report.controller.js";
import {
  createReportValidationSchema,
  updateReportStatusValidationSchema,
  reportIdParamValidationSchema,
  getReportsQueryValidationSchema
} from "../validations/report.validation.js";

const router = Router();

router.post(
  "/",
  verifyJWT,
  validate(createReportValidationSchema),
  createReport
);

router.get(
  "/",
  verifyJWT,
  verifyAdmin,
  validate(getReportsQueryValidationSchema),
  getAllReports
);

router.patch(
  "/:reportId/status",
  verifyJWT,
  verifyAdmin,
  validate(updateReportStatusValidationSchema),
  updateReportStatus
);

router.delete(
  "/:reportId",
  verifyJWT,
  verifyAdmin,
  validate(reportIdParamValidationSchema),
  deleteReport
);

export default router;