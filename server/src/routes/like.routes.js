import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  likePost,
  unlikePost,
  getLikeStatus,
  getPostLikedUsers
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/:postId", likePost);

router.delete("/:postId", unlikePost);

router.get("/:postId/users", getPostLikedUsers);

router.get("/:postId/status", getLikeStatus);

export default router;