import { Router } from "express";

import validate from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";
import {
  createCommentValidationSchema,
  updateCommentValidationSchema
} from "../validations/comment.validation.js";

const router = Router();

router.post(
  "/:postId",
  verifyJWT,
  validate(createCommentValidationSchema),
  createComment
);

router.get("/:postId", verifyJWT, getCommentsByPost);

router.patch(
  "/:commentId",
  verifyJWT,
  validate(updateCommentValidationSchema),
  updateComment
);

router.delete("/:commentId", verifyJWT, deleteComment);

export default router;