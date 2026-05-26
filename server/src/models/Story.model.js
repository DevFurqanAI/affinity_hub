import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Story user is required"]
    },

    media: {
      url: {
        type: String,
        required: [true, "Story media URL is required"]
      },
      publicId: {
        type: String,
        required: [true, "Story media public id is required"]
      }
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Story media type is required"]
    },

    caption: {
      type: String,
      trim: true,
      maxlength: [300, "Story caption must not be more than 300 characters"],
      default: ""
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| TTL Index
|--------------------------------------------------------------------------
| MongoDB automatically deletes the story document after expiry.
*/
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model("Story", storySchema);

export default Story;