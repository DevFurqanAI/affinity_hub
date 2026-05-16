import mongoose from "mongoose";

const appealSchema = new mongoose.Schema(
  {
    ban: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ban",
      required: [true, "Ban is required"]
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },

    message: {
      type: String,
      required: [true, "Appeal message is required"],
      trim: true,
      minlength: [10, "Appeal message must be at least 10 characters long"],
      maxlength: [1000, "Appeal message must not be more than 1000 characters"]
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| One Pending Appeal Per Ban
|--------------------------------------------------------------------------
| A user should not spam multiple pending appeals for the same ban.
*/
appealSchema.index(
  {
    ban: 1,
    user: 1,
    status: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending"
    }
  }
);

const Appeal = mongoose.model("Appeal", appealSchema);

export default Appeal;