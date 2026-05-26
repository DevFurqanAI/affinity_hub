import mongoose from "mongoose";

const banSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Banned user is required"]
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin is required"]
    },

    reason: {
      type: String,
      required: [true, "Ban reason is required"],
      trim: true,
      minlength: [5, "Reason must be at least 5 characters long"],
      maxlength: [500, "Reason must not be more than 500 characters"]
    },

    isActive: {
      type: Boolean,
      default: true
    },

    expiresAt: {
      type: Date,
      default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Status Restoration Safety
    |--------------------------------------------------------------------------
    | Preserves the user's status before the ban.
    | Example:
    | - active       -> banned -> active
    | - deactivated  -> banned -> deactivated
    | - suspended    -> banned -> suspended
    |--------------------------------------------------------------------------
    */
    previousStatus: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active"
    },

    endType: {
      type: String,
      enum: ["removed", "expired", "appeal_accepted"],
      default: null
    },

    endedAt: {
      type: Date,
      default: null
    },

    endedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Ban = mongoose.model("Ban", banSchema);

export default Ban;