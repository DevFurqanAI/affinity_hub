import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blocker is required"]
    },

    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blocked user is required"]
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| Unique Block Rule
|--------------------------------------------------------------------------
| One user cannot block the same user twice.
*/
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const Block = mongoose.model("Block", blockSchema);

export default Block;