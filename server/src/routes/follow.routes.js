import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  followUser,
  unfollowUser,
  getFollowSuggestions,
  getUserFollowers,
  getUserFollowing
} from "../controllers/follow.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/suggestions", getFollowSuggestions);

router.post("/:userId/follow", followUser);

router.delete("/:userId/unfollow", unfollowUser);

router.get("/:userId/followers", getUserFollowers);

router.get("/:userId/following", getUserFollowing);

export default router;