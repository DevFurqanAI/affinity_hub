import mongoose from "mongoose";

const userInterestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
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
| Unique User Interest Rule
|--------------------------------------------------------------------------
| One user can select one interest only once.
*/
userInterestSchema.index({ user: 1, interest: 1 }, { unique: true });

const UserInterest = mongoose.model("UserInterest", userInterestSchema);

export default UserInterest;