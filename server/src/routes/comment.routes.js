import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";
import {
  createCommentValidationSchema,
  getCommentsValidationSchema,
  updateCommentValidationSchema,
  deleteCommentValidationSchema
} from "../validations/comment.validation.js";

const router = Router();

router.use(verifyJWT);

router.post(
  "/:postId",
  validate(createCommentValidationSchema),
  createComment
);

router.get(
  "/:postId",
  validate(getCommentsValidationSchema),
  getCommentsByPost
);

router.patch(
  "/:commentId",
  validate(updateCommentValidationSchema),
  updateComment
);

router.delete(
  "/:commentId",
  validate(deleteCommentValidationSchema),
  deleteComment
);

export default router;