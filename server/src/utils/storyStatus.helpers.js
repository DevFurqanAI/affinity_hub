import Story from "../models/Story.model.js";
import StoryView from "../models/StoryView.model.js";

/*
|--------------------------------------------------------------------------
| Story Status Helper
|--------------------------------------------------------------------------
| Adds viewer-specific story state to public user objects.
|
| hasActiveStory:
|   The user currently owns at least one non-expired story.
|
| hasUnviewedStory:
|   The logged-in viewer has not viewed at least one active story
|   belonging to that user.
|--------------------------------------------------------------------------
*/
export const addStoryStatusToUsers = async (users = [], viewerId) => {
  const plainUsers = users
    .filter(Boolean)
    .map((user) => (user?.toObject ? user.toObject() : { ...user }));

  const usersWithDefaults = plainUsers.map((user) => ({
    ...user,
    hasActiveStory: false,
    hasUnviewedStory: false
  }));

  const userIds = [
    ...new Set(
      usersWithDefaults
        .map((user) => user?._id?.toString())
        .filter(Boolean)
    )
  ];

  if (!viewerId || userIds.length === 0) {
    return usersWithDefaults;
  }

  const activeStories = await Story.find({
    user: {
      $in: userIds
    },
    isDeleted: false,
    expiresAt: {
      $gt: new Date()
    }
  })
    .select("_id user")
    .lean();

  if (activeStories.length === 0) {
    return usersWithDefaults;
  }

  const viewedStories = await StoryView.find({
    story: {
      $in: activeStories.map((story) => story._id)
    },
    viewer: viewerId
  })
    .select("story")
    .lean();

  const viewedStoryIds = new Set(
    viewedStories.map((view) => view.story.toString())
  );

  const activeStoryOwnerIds = new Set();
  const unviewedStoryOwnerIds = new Set();

  activeStories.forEach((story) => {
    const ownerId = story.user.toString();

    activeStoryOwnerIds.add(ownerId);

    if (!viewedStoryIds.has(story._id.toString())) {
      unviewedStoryOwnerIds.add(ownerId);
    }
  });

  return usersWithDefaults.map((user) => {
    const userId = user._id.toString();

    return {
      ...user,
      hasActiveStory: activeStoryOwnerIds.has(userId),
      hasUnviewedStory: unviewedStoryOwnerIds.has(userId)
    };
  });
};