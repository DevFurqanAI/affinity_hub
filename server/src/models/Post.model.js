import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post author is required"]
    },

    caption: {
      type: String,
      trim: true,
      maxlength: [1000, "Caption must not be more than 1000 characters"],
      default: ""
    },

    media: {
      url: {
        type: String,
        default: ""
      },
      publicId: {
        type: String,
        default: ""
      }
    },

    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none"
    },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public"
    },

    likesCount: {
      type: Number,
      default: 0
    },

    commentsCount: {
      type: Number,
      default: 0
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;