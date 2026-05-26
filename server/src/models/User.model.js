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

    /*
    |--------------------------------------------------------------------------
    | Google Account Connection State
    |--------------------------------------------------------------------------
    | undefined:
    |   Legacy account; connection is inferred from providerId/authProvider.
    |
    | true:
    |   Google login is explicitly connected.
    |
    | false:
    |   Google login was explicitly disconnected and cannot be used again
    |   until the user reconnects it from Settings.
    |--------------------------------------------------------------------------
    */
    googleAccountLinked: {
      type: Boolean,
      default: undefined
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
      enum: ["active", "banned", "suspended", "deactivated"],
      default: "active"
    },

    deactivatedAt: {
      type: Date,
      default: null
    },

    /*
    |--------------------------------------------------------------------------
    | Administrative Suspension State
    |--------------------------------------------------------------------------
    | Suspension is controlled by admins and is different from:
    | - banned: serious violation with appeal flow
    | - deactivated: voluntarily hidden by the user
    |--------------------------------------------------------------------------
    */
    suspensionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Suspension reason must not be more than 500 characters"],
      default: ""
    },

    suspendedAt: {
      type: Date,
      default: null
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
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

    /*
    |--------------------------------------------------------------------------
    | Password Reset OTP State
    |--------------------------------------------------------------------------
    | Password reset uses a separate OTP flow from initial email verification.
    |--------------------------------------------------------------------------
    */
    passwordResetOtpHash: {
      type: String,
      select: false,
      default: null
    },

    passwordResetOtpExpires: {
      type: Date,
      select: false,
      default: null
    },

    passwordResetOtpAttempts: {
      type: Number,
      default: 0,
      select: false
    },

    lastPasswordResetOtpSentAt: {
      type: Date,
      select: false,
      default: null
    },

    /*
    |--------------------------------------------------------------------------
    | One-Time Password Reset Grant
    |--------------------------------------------------------------------------
    | After OTP verification, the server returns a one-time raw reset token.
    | Only its hash is stored in the database.
    |--------------------------------------------------------------------------
    */
    passwordResetTokenHash: {
      type: String,
      select: false,
      default: null
    },

    passwordResetTokenExpires: {
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