import Interest from "../models/Interest.model.js";
import UserInterest from "../models/UserInterest.model.js";
import PostInterest from "../models/PostInterest.model.js";
import NewInterestCounter from "../models/NewInterestCounter.model.js";

const interestKeywordMap = {
  technology: [
    "code",
    "coding",
    "programming",
    "developer",
    "development",
    "software",
    "app",
    "web",
    "react",
    "node",
    "express",
    "mongodb",
    "database",
    "api",
    "backend",
    "frontend",
    "javascript",
    "ai",
    "computer",
    "tech",
    "middleware"
  ],

  education: [
    "study",
    "studying",
    "exam",
    "lecture",
    "notes",
    "assignment",
    "class",
    "university",
    "college",
    "school",
    "learning",
    "teacher",
    "student",
    "revision",
    "semester",
    "course"
  ],

  fitness: [
    "gym",
    "workout",
    "fitness",
    "health",
    "exercise",
    "training",
    "running",
    "diet",
    "motivation",
    "strength"
  ],

  travel: [
    "travel",
    "trip",
    "tour",
    "journey",
    "place",
    "city",
    "explore",
    "adventure",
    "vacation",
    "photos"
  ],

  food: [
    "food",
    "meal",
    "restaurant",
    "cafe",
    "recipe",
    "pizza",
    "burger",
    "tea",
    "coffee",
    "lunch",
    "dinner",
    "breakfast"
  ],

  gaming: [
    "game",
    "gaming",
    "gamer",
    "esports",
    "pubg",
    "valorant",
    "minecraft",
    "console",
    "stream",
    "match"
  ],

  music: [
    "music",
    "song",
    "songs",
    "artist",
    "concert",
    "guitar",
    "piano",
    "playlist",
    "singing",
    "album"
  ],

  sports: [
    "sports",
    "cricket",
    "football",
    "match",
    "team",
    "goal",
    "score",
    "player",
    "tournament",
    "fitness"
  ],

  art: [
    "art",
    "design",
    "drawing",
    "painting",
    "poster",
    "creative",
    "typography",
    "colors",
    "sketch",
    "photography"
  ],

  business: [
    "business",
    "startup",
    "entrepreneur",
    "finance",
    "money",
    "marketing",
    "idea",
    "sales",
    "brand",
    "project"
  ]
};

const normalizeText = (text = "") => {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
};

const keywordExists = (text, keyword) => {
  const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|\\s)${safeKeyword}(\\s|$)`, "i");

  return regex.test(text);
};

const detectInterestNamesFromCaption = (caption = "") => {
  const normalizedCaption = normalizeText(caption);
  const detectedNames = [];

  Object.entries(interestKeywordMap).forEach(([interestName, keywords]) => {
    const matched = keywords.some((keyword) =>
      keywordExists(normalizedCaption, keyword)
    );

    if (matched) {
      detectedNames.push(interestName);
    }
  });

  return detectedNames;
};

const updateInterestCounters = async (interestIds = []) => {
  const uniqueInterestIds = [
    ...new Set(interestIds.map((interestId) => interestId.toString()))
  ];

  for (const interestId of uniqueInterestIds) {
    const userCount = await UserInterest.countDocuments({
      interest: interestId
    });

    const postCount = await PostInterest.countDocuments({
      interest: interestId
    });

    await NewInterestCounter.findOneAndUpdate(
      {
        interest: interestId
      },
      {
        $set: {
          userCount,
          postCount
        }
      },
      {
        upsert: true,
        new: true
      }
    );
  }
};

const getFallbackAuthorInterestIds = async (authorId) => {
  const userInterests = await UserInterest.find({
    user: authorId
  })
    .select("interest")
    .limit(2);

  return userInterests.map((item) => item.interest);
};

export const syncPostInterestsFromCaption = async ({
  postId,
  authorId,
  caption = ""
}) => {
  const oldPostInterests = await PostInterest.find({
    post: postId
  }).select("interest");

  const oldInterestIds = oldPostInterests.map((item) => item.interest);

  const detectedInterestNames = detectInterestNamesFromCaption(caption);

  const detectedInterests = await Interest.find({
    name: {
      $in: detectedInterestNames
    },
    isActive: true
  }).select("_id");

  let nextInterestIds = detectedInterests.map((interest) => interest._id);

  /*
  |--------------------------------------------------------------------------
  | Soft Fallback
  |--------------------------------------------------------------------------
  | If the caption does not contain clear keywords, use 1–2 interests selected
  | by the author. This keeps interest-based discovery useful without forcing
  | the user to manually select interests during post creation.
  */
  if (nextInterestIds.length === 0 && authorId) {
    nextInterestIds = await getFallbackAuthorInterestIds(authorId);
  }

  const uniqueNextInterestIds = [
    ...new Map(
      nextInterestIds.map((interestId) => [
        interestId.toString(),
        interestId
      ])
    ).values()
  ];

  await PostInterest.deleteMany({
    post: postId
  });

  if (uniqueNextInterestIds.length > 0) {
    await PostInterest.insertMany(
      uniqueNextInterestIds.map((interestId) => ({
        post: postId,
        interest: interestId
      })),
      {
        ordered: false
      }
    );
  }

  await updateInterestCounters([...oldInterestIds, ...uniqueNextInterestIds]);

  return uniqueNextInterestIds;
};

export const clearPostInterests = async (postId) => {
  const oldPostInterests = await PostInterest.find({
    post: postId
  }).select("interest");

  const oldInterestIds = oldPostInterests.map((item) => item.interest);

  await PostInterest.deleteMany({
    post: postId
  });

  await updateInterestCounters(oldInterestIds);
};