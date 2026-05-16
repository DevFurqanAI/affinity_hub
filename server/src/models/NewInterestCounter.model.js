import mongoose from "mongoose";

const newInterestCounterSchema = new mongoose.Schema(
  {
    interest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
      required: [true, "Interest is required"],
      unique: true
    },

    userCount: {
      type: Number,
      default: 0
    },

    postCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const NewInterestCounter = mongoose.model(
  "NewInterestCounter",
  newInterestCounterSchema
);

export default NewInterestCounter;