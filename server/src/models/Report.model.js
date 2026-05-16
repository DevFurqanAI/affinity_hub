import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"]
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target id is required"]
    },

    targetType: {
      type: String,
      enum: ["user", "post", "comment", "story"],
      required: [true, "Target type is required"]
    },

    reason: {
      type: String,
      required: [true, "Report reason is required"],
      trim: true,
      minlength: [5, "Reason must be at least 5 characters long"],
      maxlength: [500, "Reason must not be more than 500 characters"]
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "rejected", "action_taken"],
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
| Duplicate Report Prevention
|--------------------------------------------------------------------------
| One user cannot report the same target again.
*/
reportSchema.index(
  {
    reporter: 1,
    targetId: 1,
    targetType: 1
  },
  {
    unique: true
  }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;