import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Interest name is required"],
      trim: true,
      lowercase: true,
      unique: true,
      minlength: [2, "Interest name must be at least 2 characters long"],
      maxlength: [40, "Interest name must not be more than 40 characters"]
    },

    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
      minlength: [2, "Display name must be at least 2 characters long"],
      maxlength: [40, "Display name must not be more than 40 characters"]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description must not be more than 200 characters"],
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Interest = mongoose.model("Interest", interestSchema);

export default Interest;