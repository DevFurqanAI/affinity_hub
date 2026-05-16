import { Router } from "express";

import validate from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser
} from "../controllers/auth.controller.js";
import {
  registerValidationSchema,
  loginValidationSchema
} from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerValidationSchema), registerUser);

router.post("/login", validate(loginValidationSchema), loginUser);

router.post("/refresh", refreshAccessToken);

router.post("/logout", verifyJWT, logoutUser);

router.get("/me", verifyJWT, getCurrentUser);

export default router;