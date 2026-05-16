import mongoose from "mongoose";

const storyViewSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: [true, "Story is required"]
    },

    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Viewer is required"]
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Unique View Rule
|--------------------------------------------------------------------------
| One user can view one story only once.
*/
storyViewSchema.index({ story: 1, viewer: 1 }, { unique: true });

const StoryView = mongoose.model("StoryView", storyViewSchema);

export default StoryView;