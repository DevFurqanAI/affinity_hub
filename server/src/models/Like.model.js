import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"]
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Unique Like Rule
|--------------------------------------------------------------------------
| One user can like one post only once.
*/
likeSchema.index({ post: 1, user: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;