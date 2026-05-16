import mongoose from "mongoose";

import Story from "../models/Story.model.js";
import StoryView from "../models/StoryView.model.js";
import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const storyOwnerPopulate = {
  path: "user",
  select: "name username avatar"
};

const storyViewerPopulate = {
  path: "viewer",
  select: "name username avatar"
};

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const checkCloudinaryConfig = () => {
  if (
    !env.cloudinaryCloudName ||
    !env.cloudinaryApiKey ||
    !env.cloudinaryApiSecret
  ) {
    throw new ApiError(
      500,
      "Cloudinary configuration is missing. Please check server/.env"
    );
  }
};

const getMediaTypeFromMime = (mimeType) => {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return null;
};

const uploadBufferToCloudinary = (fileBuffer, mediaType) => {
  checkCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinaryFolder}/stories`,
        resource_type: mediaType === "video" ? "video" : "image"
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/*
|--------------------------------------------------------------------------
| POST /api/stories
|--------------------------------------------------------------------------
| Create story with image/video media.
*/
export const createStory = asyncHandler(async (req, res) => {
  const { caption = "" } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Story media is required");
  }

  const mediaType = getMediaTypeFromMime(req.file.mimetype);

  if (!mediaType) {
    throw new ApiError(400, "Invalid story media type");
  }

  let uploadedMedia;

  try {
    uploadedMedia = await uploadBufferToCloudinary(req.file.buffer, mediaType);
  } catch (error) {
    console.error("Cloudinary story upload error:", error);

    throw new ApiError(
      500,
      "Story media upload failed. Please check Cloudinary credentials or internet connection."
    );
  }

  if (!uploadedMedia?.secure_url || !uploadedMedia?.public_id) {
    throw new ApiError(500, "Story upload failed. No media URL received.");
  }

  const story = await Story.create({
    user: req.user._id,
    media: {
      url: uploadedMedia.secure_url,
      publicId: uploadedMedia.public_id
    },
    mediaType,
    caption,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  const populatedStory = await Story.findById(story._id).populate(
    storyOwnerPopulate
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, { story: populatedStory }, "Story created successfully")
    );
});

/*
|--------------------------------------------------------------------------
| GET /api/stories/feed
|--------------------------------------------------------------------------
| Feed includes:
| - current user's stories
| - followed users' stories
*/
export const getStoryFeed = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select("following");

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  const userIds = [req.user._id, ...currentUser.following];

  const stories = await Story.find({
    user: {
      $in: userIds
    },
    expiresAt: {
      $gt: new Date()
    }
  })
    .populate(storyOwnerPopulate)
    .sort({ createdAt: -1 });

  const storyIds = stories.map((story) => story._id);

  const viewedStories = await StoryView.find({
    story: {
      $in: storyIds
    },
    viewer: req.user._id
  }).select("story");

  const viewedStoryIds = new Set(
    viewedStories.map((view) => view.story.toString())
  );

  const storiesWithViewStatus = stories.map((story) => {
    const storyObject = story.toObject();

    storyObject.isViewedByMe = viewedStoryIds.has(story._id.toString());

    return storyObject;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stories: storiesWithViewStatus
      },
      "Story feed fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| POST /api/stories/:storyId/view
|--------------------------------------------------------------------------
| Mark story as viewed by logged-in user.
| Duplicate views are prevented.
*/
export const viewStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!isValidMongoId(storyId)) {
    throw new ApiError(400, "Invalid story id");
  }

  const story = await Story.findOne({
    _id: storyId,
    expiresAt: {
      $gt: new Date()
    }
  });

  if (!story) {
    throw new ApiError(404, "Story not found or expired");
  }

  const existingView = await StoryView.findOne({
    story: story._id,
    viewer: req.user._id
  });

  if (existingView) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          storyId: story._id,
          isViewedByMe: true,
          alreadyViewed: true
        },
        "Story already viewed"
      )
    );
  }

  const storyView = await StoryView.create({
    story: story._id,
    viewer: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        storyId: story._id,
        view: storyView,
        isViewedByMe: true,
        alreadyViewed: false
      },
      "Story viewed successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET /api/stories/:storyId/views
|--------------------------------------------------------------------------
| Only story owner can see viewers.
*/
export const getStoryViews = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!isValidMongoId(storyId)) {
    throw new ApiError(400, "Invalid story id");
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  if (story.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view viewers of your own story");
  }

  const views = await StoryView.find({
    story: story._id
  })
    .populate(storyViewerPopulate)
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        views,
        viewsCount: views.length
      },
      "Story views fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE /api/stories/:storyId
|--------------------------------------------------------------------------
| Only owner can delete story.
*/
export const deleteStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!isValidMongoId(storyId)) {
    throw new ApiError(400, "Invalid story id");
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  if (story.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own story");
  }

  if (story.media?.publicId) {
    try {
      await cloudinary.uploader.destroy(story.media.publicId, {
        resource_type: story.mediaType === "video" ? "video" : "image"
      });
    } catch (error) {
      console.error("Cloudinary story delete error:", error);
    }
  }

  await StoryView.deleteMany({
    story: story._id
  });

  await Story.findByIdAndDelete(story._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Story deleted successfully"));
});