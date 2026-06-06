import Report from "../models/Report.model.js";
import Ban from "../models/Ban.model.js";
import Appeal from "../models/Appeal.model.js";
import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

const getUser = (users, username) => {
  return users.find((user) => user.username === username);
};

const seedModeration = async ({ admin, users, posts }) => {
  const furqan = getUser(users, "furqan");
  const ayesha = getUser(users, "ayesha");
  const maham = getUser(users, "maham");
  const reportedUser = getUser(users, "reporteduser");

  const pendingTargetPost = posts[5];

  if (furqan && pendingTargetPost) {
    await Report.create({
      reporter: furqan._id,
      targetId: pendingTargetPost._id,
      targetType: "post",
      reason: "This post looks suspicious and may need moderation review.",
      status: "pending",
      moderationAction: "none"
    });
  }

  let ban = null;

  if (reportedUser && admin) {
    reportedUser.status = "banned";
    await reportedUser.save({ validateBeforeSave: false });

    ban = await Ban.create({
      user: reportedUser._id,
      admin: admin._id,
      reason: "Repeated spam and abusive interactions in the demo environment.",
      isActive: true,
      expiresAt: null,
      previousStatus: "active"
    });

    await Report.create({
      reporter: ayesha?._id || furqan._id,
      targetId: reportedUser._id,
      targetType: "user",
      reason: "This user repeatedly posted spam and violated community rules.",
      status: "action_taken",
      moderationAction: "user_banned",
      moderationNote: "Admin reviewed the report and banned the user.",
      moderationBan: ban._id,
      actionTakenAt: new Date(),
      reviewedBy: admin._id,
      reviewedAt: new Date()
    });

    await Appeal.create({
      ban: ban._id,
      user: reportedUser._id,
      message:
        "I understand the violation and request another chance to use the platform responsibly.",
      status: "pending"
    });

    await Notification.create({
      receiver: reportedUser._id,
      sender: admin._id,
      type: "ban",
      referenceId: ban._id,
      message: "Your account was banned due to a community guideline violation.",
      isRead: false
    });

    await Notification.create({
      receiver: admin._id,
      sender: reportedUser._id,
      type: "appeal",
      referenceId: ban._id,
      message: "Reported Demo User submitted a ban appeal.",
      isRead: false
    });
  }

  if (maham && admin) {
    await Notification.create({
      receiver: maham._id,
      sender: admin._id,
      type: "report_action",
      message: "A report was reviewed by the moderation team.",
      isRead: true
    });
  }

  console.log("Sample moderation data created.");

  return {
    ban
  };
};

export default seedModeration;