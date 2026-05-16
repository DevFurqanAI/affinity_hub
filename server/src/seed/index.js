import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import env from "../config/env.js";

import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import Comment from "../models/Comment.model.js";
import Like from "../models/Like.model.js";
import Notification from "../models/Notification.model.js";
import Story from "../models/Story.model.js";
import StoryView from "../models/StoryView.model.js";
import Interest from "../models/Interest.model.js";
import UserInterest from "../models/UserInterest.model.js";
import PostInterest from "../models/PostInterest.model.js";
import NewInterestCounter from "../models/NewInterestCounter.model.js";
import Report from "../models/Report.model.js";
import Ban from "../models/Ban.model.js";
import Appeal from "../models/Appeal.model.js";
import Block from "../models/Block.model.js";

import seedAdmin, { demoAdminData } from "./seedAdmin.js";
import seedUsers, { demoUsersData } from "./seedUsers.js";
import seedPosts from "./seedPosts.js";

const demoEmails = [
  demoAdminData.email,
  ...demoUsersData.map((user) => user.email)
];

const demoInterestNames = [
  "technology",
  "fitness",
  "education",
  "travel",
  "food",
  "gaming",
  "music",
  "sports",
  "art",
  "business"
];

const stopIfProduction = () => {
  if (env.nodeEnv === "production" || process.env.NODE_ENV === "production") {
    console.error("Seed script stopped.");
    console.error("Reason: NODE_ENV is production.");
    console.error("This script is only for local/demo testing data.");
    process.exit(1);
  }
};

const clearOldDemoData = async () => {
  console.log("Finding old demo users...");

  const oldDemoUsers = await User.find({
    email: {
      $in: demoEmails
    }
  }).select("_id");

  const oldDemoUserIds = oldDemoUsers.map((user) => user._id);

  const oldDemoPosts = await Post.find({
    author: {
      $in: oldDemoUserIds
    }
  }).select("_id");

  const oldDemoPostIds = oldDemoPosts.map((post) => post._id);

  const oldDemoComments = await Comment.find({
    $or: [
      {
        author: {
          $in: oldDemoUserIds
        }
      },
      {
        post: {
          $in: oldDemoPostIds
        }
      }
    ]
  }).select("_id");

  const oldDemoCommentIds = oldDemoComments.map((comment) => comment._id);

  const oldDemoStories = await Story.find({
    user: {
      $in: oldDemoUserIds
    }
  }).select("_id");

  const oldDemoStoryIds = oldDemoStories.map((story) => story._id);

  const oldDemoBans = await Ban.find({
    user: {
      $in: oldDemoUserIds
    }
  }).select("_id");

  const oldDemoBanIds = oldDemoBans.map((ban) => ban._id);

  const oldDemoInterests = await Interest.find({
    name: {
      $in: demoInterestNames
    }
  }).select("_id");

  const oldDemoInterestIds = oldDemoInterests.map((interest) => interest._id);

  console.log("Clearing old demo data safely...");

  await Promise.all([
    Like.deleteMany({
      $or: [
        {
          user: {
            $in: oldDemoUserIds
          }
        },
        {
          post: {
            $in: oldDemoPostIds
          }
        }
      ]
    }),

    Comment.deleteMany({
      _id: {
        $in: oldDemoCommentIds
      }
    }),

    PostInterest.deleteMany({
      $or: [
        {
          post: {
            $in: oldDemoPostIds
          }
        },
        {
          interest: {
            $in: oldDemoInterestIds
          }
        }
      ]
    }),

    UserInterest.deleteMany({
      $or: [
        {
          user: {
            $in: oldDemoUserIds
          }
        },
        {
          interest: {
            $in: oldDemoInterestIds
          }
        }
      ]
    }),

    NewInterestCounter.deleteMany({
      interest: {
        $in: oldDemoInterestIds
      }
    }),

    Notification.deleteMany({
      $or: [
        {
          receiver: {
            $in: oldDemoUserIds
          }
        },
        {
          sender: {
            $in: oldDemoUserIds
          }
        },
        {
          post: {
            $in: oldDemoPostIds
          }
        },
        {
          comment: {
            $in: oldDemoCommentIds
          }
        },
        {
          story: {
            $in: oldDemoStoryIds
          }
        }
      ]
    }),

    StoryView.deleteMany({
      $or: [
        {
          story: {
            $in: oldDemoStoryIds
          }
        },
        {
          viewer: {
            $in: oldDemoUserIds
          }
        }
      ]
    }),

    Story.deleteMany({
      _id: {
        $in: oldDemoStoryIds
      }
    }),

    Report.deleteMany({
      $or: [
        {
          reporter: {
            $in: oldDemoUserIds
          }
        },
        {
          targetId: {
            $in: [
              ...oldDemoUserIds,
              ...oldDemoPostIds,
              ...oldDemoCommentIds,
              ...oldDemoStoryIds
            ]
          }
        }
      ]
    }),

    Appeal.deleteMany({
      $or: [
        {
          user: {
            $in: oldDemoUserIds
          }
        },
        {
          ban: {
            $in: oldDemoBanIds
          }
        }
      ]
    }),

    Ban.deleteMany({
      $or: [
        {
          user: {
            $in: oldDemoUserIds
          }
        },
        {
          admin: {
            $in: oldDemoUserIds
          }
        }
      ]
    }),

    Block.deleteMany({
      $or: [
        {
          blocker: {
            $in: oldDemoUserIds
          }
        },
        {
          blocked: {
            $in: oldDemoUserIds
          }
        }
      ]
    }),

    Post.deleteMany({
      _id: {
        $in: oldDemoPostIds
      }
    }),

    Interest.deleteMany({
      _id: {
        $in: oldDemoInterestIds
      }
    }),

    User.deleteMany({
      _id: {
        $in: oldDemoUserIds
      }
    })
  ]);

  console.log("Old demo data cleared.");
};

const runSeed = async () => {
  try {
    stopIfProduction();

    await connectDB();

    console.log("Connected to MongoDB.");
    console.log("Starting Affinity Hub demo seed...");

    await clearOldDemoData();

    const admin = await seedAdmin();
    const users = await seedUsers();

    await seedPosts(users);

    console.log("");
    console.log("Demo seed completed successfully.");
    console.log("");
    console.log("Login credentials:");
    console.log("-----------------------------------");
    console.log(`Admin: ${demoAdminData.email}`);
    console.log(`Admin password: ${demoAdminData.password}`);
    console.log("");
    console.log("Normal users:");
    demoUsersData.forEach((user) => {
      console.log(`${user.name}: ${user.email}`);
    });
    console.log("Normal user password: Demo@123456");
    console.log("-----------------------------------");
    console.log("");

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:");
    console.error(error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

runSeed();