import Comment from "../models/Comment.model.js";
import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import createNotification from "../utils/createNotification.js";

const commentAuthorPopulate = {
  path: "author",
  select: "name username avatar"
};

const getPaginationValues = (req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 && limit <= 50 ? limit : 10;
  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip
  };
};

/*
|--------------------------------------------------------------------------
| POST /api/comments/:postId
|--------------------------------------------------------------------------
| Create a comment on a non-deleted post.
*/
export const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content
  });

  post.commentsCount += 1;
  await post.save({ validateBeforeSave: false });

  const populatedComment = await Comment.findById(comment._id).populate(
    commentAuthorPopulate
  );

  const sender = await User.findById(req.user._id).select("name");

  await createNotification({
    receiver: post.author,
    sender: req.user._id,
    type: "comment",
    post: post._id,
    comment: comment._id,
    referenceId: comment._id,
    message: `${sender?.name || "Someone"} commented on your post`
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        comment: populatedComment,
        commentsCount: post.commentsCount
      },
      "Comment added successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/comments/:postId
|--------------------------------------------------------------------------
| Get comments of a post with pagination.
*/
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page, limit, skip } = getPaginationValues(req);

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false
  }).select("_id commentsCount");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const query = {
    post: postId,
    isDeleted: false
  };

  const totalComments = await Comment.countDocuments(query);

  const comments = await Comment.find(query)
    .populate(commentAuthorPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalComments / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          page,
          limit,
          totalPages,
          totalComments
        },
        commentsCount: post.commentsCount
      },
      "Comments fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| PATCH /api/comments/:commentId
|--------------------------------------------------------------------------
| Only comment owner can edit.
*/
export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own comment");
  }

  const post = await Post.findOne({
    _id: comment.post,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  comment.content = content;
  await comment.save();

  const updatedComment = await Comment.findById(comment._id).populate(
    commentAuthorPopulate
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comment: updatedComment },
        "Comment updated successfully"
      )
    );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/comments/:commentId
|--------------------------------------------------------------------------
| Only comment owner can delete.
| Soft delete comment and reduce Post.commentsCount.
*/
export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own comment");
  }

  const post = await Post.findOne({
    _id: comment.post,
    isDeleted: false
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  comment.isDeleted = true;
  await comment.save({ validateBeforeSave: false });

  post.commentsCount = Math.max(post.commentsCount - 1, 0);
  await post.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        commentId,
        commentsCount: post.commentsCount
      },
      "Comment deleted successfully"
    )
  );
});