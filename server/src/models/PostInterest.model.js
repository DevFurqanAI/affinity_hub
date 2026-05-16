import mongoose from "mongoose";

const postInterestSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"]
    },

    interest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
      required: [true, "Interest is required"]
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Unique Post Interest Rule
|--------------------------------------------------------------------------
| One post can have one interest tag only once.
*/
postInterestSchema.index({ post: 1, interest: 1 }, { unique: true });

const PostInterest = mongoose.model("PostInterest", postInterestSchema);

export default PostInterest;