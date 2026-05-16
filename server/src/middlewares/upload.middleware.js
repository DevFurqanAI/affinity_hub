import multer from "multer";

import ApiError from "../utils/ApiError.js";

/*
|--------------------------------------------------------------------------
| Multer Memory Storage
|--------------------------------------------------------------------------
| Files are temporarily stored in memory.
| Controllers upload the file buffer to Cloudinary.
*/
const storage = multer.memoryStorage();

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const videoMimeTypes = ["video/mp4", "video/webm", "video/quicktime"];

const avatarFileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, JPEG, PNG, and WEBP images are allowed"));
  }
};

const postMediaFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [...imageMimeTypes, ...videoMimeTypes];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Only image files JPG, JPEG, PNG, WEBP and video files MP4, WEBM, MOV are allowed"
      )
    );
  }
};

const storyMediaFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [...imageMimeTypes, ...videoMimeTypes];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Only image files JPG, JPEG, PNG, WEBP and video files MP4, WEBM, MOV are allowed for stories"
      )
    );
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
}).single("avatar");

export const uploadPostMedia = multer({
  storage,
  fileFilter: postMediaFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
}).single("media");

export const uploadStoryMedia = multer({
  storage,
  fileFilter: storyMediaFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
}).single("media");