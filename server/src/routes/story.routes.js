import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadStoryMedia } from "../middlewares/upload.middleware.js";
import {
  createStory,
  getStoryFeed,
  getStoryViews,
  deleteStory,
  viewStory
} from "../controllers/story.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/", uploadStoryMedia, createStory);

router.get("/feed", getStoryFeed);

router.post("/:storyId/view", viewStory);

router.get("/:storyId/views", getStoryViews);

router.delete("/:storyId", deleteStory);

export default router;