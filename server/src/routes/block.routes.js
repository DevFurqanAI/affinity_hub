import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  blockUser,
  unblockUser,
  getMyBlockedUsers
} from "../controllers/block.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getMyBlockedUsers);

router.post("/:userId", blockUser);

router.delete("/:userId", unblockUser);

export default router;