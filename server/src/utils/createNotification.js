import Notification from "../models/Notification.model.js";

/*
|--------------------------------------------------------------------------
| Create Notification Utility
|--------------------------------------------------------------------------
| This helper creates notifications in a safe reusable way.
| It also prevents creating a notification when receiver and sender are same.
*/

const createNotification = async ({
  receiver,
  sender = null,
  type,
  post = null,
  comment = null,
  story = null,
  referenceId = null,
  message
}) => {
  if (!receiver || !type || !message) {
    return null;
  }

  if (sender && receiver.toString() === sender.toString()) {
    return null;
  }

  const notification = await Notification.create({
    receiver,
    sender,
    type,
    post,
    comment,
    story,
    referenceId,
    message
  });

  return notification;
};

export default createNotification;