import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [60, "Name must not be more than 60 characters"]
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username must not be more than 30 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      select: false,
      minlength: [6, "Password must be at least 6 characters long"]
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local"
    },

    providerId: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [250, "Bio must not be more than 250 characters"],
      default: ""
    },

    avatar: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    status: {
      type: String,
      enum: ["active", "banned", "suspended"],
      default: "active"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    /*
    |--------------------------------------------------------------------------
    | Onboarding flags
    |--------------------------------------------------------------------------
    | Important:
    | - New users are explicitly created with false in register/google auth.
    | - Old users should not be accidentally trapped in onboarding.
    | - Undefined is treated as completed by frontend guards.
    */
    profileSetupCompleted: {
      type: Boolean,
      default: undefined
    },

    interestsSetupCompleted: {
      type: Boolean,
      default: undefined
    },

    emailVerificationOtpHash: {
      type: String,
      select: false,
      default: null
    },

    emailVerificationOtpExpires: {
      type: Date,
      select: false,
      default: null
    },

    emailVerificationOtpAttempts: {
      type: Number,
      default: 0,
      select: false
    },

    lastVerificationOtpSentAt: {
      type: Date,
      select: false,
      default: null
    },

    refreshToken: {
      type: String,
      select: false,
      default: null
    },

    lastLogin: {
      type: Date,
      default: null
    },

    failedLoginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: {
      type: Date,
      default: null
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    followersCount: {
      type: Number,
      default: 0
    },

    followingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.isAccountLocked = function () {
  if (!this.lockUntil) {
    return false;
  }

  return this.lockUntil > new Date();
};

const User = mongoose.model("User", userSchema);

export default User;