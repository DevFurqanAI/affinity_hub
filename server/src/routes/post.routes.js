import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { uploadPostMedia } from "../middlewares/upload.middleware.js";
import {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUsername
} from "../controllers/post.controller.js";
import {
  createPostValidationSchema,
  updatePostValidationSchema,
  postIdParamValidationSchema,
  usernameParamValidationSchemaForPosts
} from "../validations/post.validation.js";

const router = Router();

router.use(verifyJWT);

router.post("/", uploadPostMedia, validate(createPostValidationSchema), createPost);

router.get("/feed", getFeedPosts);

router.get("/explore", getExplorePosts);

router.get(
  "/user/:username",
  validate(usernameParamValidationSchemaForPosts),
  getPostsByUsername
);

router.get("/:postId", validate(postIdParamValidationSchema), getPostById);

router.patch("/:postId", validate(updatePostValidationSchema), updatePost);

router.delete("/:postId", validate(postIdParamValidationSchema), deletePost);

export default router;