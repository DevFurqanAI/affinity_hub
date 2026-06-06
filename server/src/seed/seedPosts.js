import Interest from "../models/Interest.model.js";
import UserInterest from "../models/UserInterest.model.js";
import Post from "../models/Post.model.js";
import Comment from "../models/Comment.model.js";
import Like from "../models/Like.model.js";
import Notification from "../models/Notification.model.js";
import NewInterestCounter from "../models/NewInterestCounter.model.js";
import PostInterest from "../models/PostInterest.model.js";
import { syncPostInterestsFromCaption } from "../utils/postInterestTagger.js";

export const interestData = [
  {
    name: "technology",
    displayName: "Technology",
    description: "Programming, gadgets, AI, and digital trends"
  },
  {
    name: "fitness",
    displayName: "Fitness",
    description: "Gym, health, workouts, and lifestyle"
  },
  {
    name: "education",
    displayName: "Education",
    description: "Learning, exams, university, and study life"
  },
  {
    name: "travel",
    displayName: "Travel",
    description: "Places, trips, culture, and exploration"
  },
  {
    name: "food",
    displayName: "Food",
    description: "Recipes, restaurants, and food experiences"
  },
  {
    name: "gaming",
    displayName: "Gaming",
    description: "Games, esports, and gaming communities"
  },
  {
    name: "music",
    displayName: "Music",
    description: "Songs, artists, instruments, and concerts"
  },
  {
    name: "sports",
    displayName: "Sports",
    description: "Cricket, football, and sports discussions"
  },
  {
    name: "art",
    displayName: "Art",
    description: "Design, drawing, creativity, and visual arts"
  },
  {
    name: "business",
    displayName: "Business",
    description: "Startups, entrepreneurship, and finance"
  }
];

const getUser = (users, username) => {
  return users.find((user) => user.username === username);
};

const getInterest = (interests, name) => {
  return interests.find((interest) => interest.name === name);
};

const createDemoInterests = async () => {
  const interests = [];

  for (const item of interestData) {
    const interest = await Interest.findOneAndUpdate(
      {
        name: item.name
      },
      {
        $set: {
          displayName: item.displayName,
          description: item.description,
          isActive: true
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    interests.push(interest);
  }

  console.log(`${interests.length} interests upserted.`);

  return interests;
};

const createSampleFollows = async (users) => {
  const furqan = getUser(users, "furqan");
  const ali = getUser(users, "aliraza");
  const ayesha = getUser(users, "ayesha");
  const hamza = getUser(users, "hamza");
  const maham = getUser(users, "maham");
  const usman = getUser(users, "usman");
  const zara = getUser(users, "zara");

  const followPairs = [
    [furqan, ali],
    [furqan, ayesha],
    [furqan, hamza],
    [ali, furqan],
    [ali, usman],
    [ayesha, furqan],
    [ayesha, maham],
    [hamza, furqan],
    [hamza, zara],
    [maham, furqan],
    [usman, hamza],
    [zara, ayesha]
  ];

  for (const [follower, following] of followPairs) {
    if (!follower || !following) {
      continue;
    }

    const alreadyFollowing = follower.following.some(
      (id) => id.toString() === following._id.toString()
    );

    if (!alreadyFollowing) {
      follower.following.push(following._id);
    }

    const alreadyFollower = following.followers.some(
      (id) => id.toString() === follower._id.toString()
    );

    if (!alreadyFollower) {
      following.followers.push(follower._id);
    }
  }

  for (const user of users) {
    user.followingCount = user.following.length;
    user.followersCount = user.followers.length;
    await user.save({ validateBeforeSave: false });
  }

  console.log("Sample follow relationships created.");
};

const createUserInterests = async (users, interests) => {
  const mapping = {
    furqan: ["technology", "education", "art"],
    aliraza: ["fitness", "sports", "music"],
    ayesha: ["education", "food", "travel"],
    hamza: ["technology", "business", "gaming"],
    maham: ["food", "travel", "art"],
    usman: ["gaming", "sports", "music"],
    zara: ["art", "music", "travel"],
    reporteduser: ["gaming", "sports", "music"]
  };

  const docs = [];

  for (const user of users) {
    const userInterestNames = mapping[user.username] || [];

    for (const interestName of userInterestNames) {
      const interest = getInterest(interests, interestName);

      if (interest) {
        docs.push({
          user: user._id,
          interest: interest._id
        });
      }
    }
  }

  if (docs.length > 0) {
    await UserInterest.insertMany(docs);
  }

  console.log("Sample user interests created.");
};

const createPosts = async (users) => {
  const postsData = [
    {
      author: getUser(users, "furqan"),
      caption:
        "Started polishing the Affinity Hub frontend today. React, Tailwind, and responsive UI make such a big difference.",
      visibility: "public"
    },
    {
      author: getUser(users, "furqan"),
      caption:
        "DSA revision mode is on. Exam notes, AVL rotations, and study planning finally feel easier now.",
      visibility: "followers"
    },
    {
      author: getUser(users, "aliraza"),
      caption:
        "Morning workout complete. Gym consistency beats motivation every single time.",
      visibility: "public"
    },
    {
      author: getUser(users, "ayesha"),
      caption:
        "Study tip: make small notes after every lecture. Future you will thank you before exams.",
      visibility: "public"
    },
    {
      author: getUser(users, "hamza"),
      caption:
        "Built a clean Express middleware today. Backend utilities and API structure save so much time later.",
      visibility: "public"
    },
    {
      author: getUser(users, "maham"),
      caption:
        "Tried a new cafe today. Good food, peaceful place, perfect for working on assignments.",
      visibility: "public"
    },
    {
      author: getUser(users, "usman"),
      caption:
        "Late night gaming session with friends. Sometimes a gaming break is also productivity.",
      visibility: "public"
    },
    {
      author: getUser(users, "zara"),
      caption:
        "Working on a new poster design. Simple colors, clean typography, and creative spacing.",
      visibility: "public"
    },
    {
      author: getUser(users, "hamza"),
      caption:
        "Startup idea: a collaboration platform for group projects, deadlines, and peer review.",
      visibility: "public"
    },
    {
      author: getUser(users, "ayesha"),
      caption:
        "Weekend travel plan: explore a quiet place, take photos, and reset for next week.",
      visibility: "public"
    }
  ];

  const posts = [];

  for (const item of postsData) {
    if (!item.author) {
      continue;
    }

    const post = await Post.create({
      author: item.author._id,
      caption: item.caption,
      visibility: item.visibility,
      media: {
        url: "",
        publicId: ""
      },
      mediaType: "none",
      likesCount: 0,
      commentsCount: 0,
      isDeleted: false
    });

    await syncPostInterestsFromCaption({
      postId: post._id,
      authorId: item.author._id,
      caption: post.caption
    });

    posts.push(post);
  }

  console.log(`${posts.length} sample posts created and auto-tagged.`);

  return posts;
};

const createComments = async (posts, users) => {
  const furqan = getUser(users, "furqan");
  const ali = getUser(users, "aliraza");
  const ayesha = getUser(users, "ayesha");
  const hamza = getUser(users, "hamza");
  const maham = getUser(users, "maham");
  const usman = getUser(users, "usman");
  const zara = getUser(users, "zara");

  const commentsData = [
    {
      post: posts[0],
      author: hamza,
      content: "This UI polish will really improve the final presentation."
    },
    {
      post: posts[0],
      author: ayesha,
      content: "Clean layout is always worth the effort."
    },
    {
      post: posts[2],
      author: furqan,
      content: "Great reminder. Consistency is everything."
    },
    {
      post: posts[3],
      author: maham,
      content: "This is actually helpful for exams."
    },
    {
      post: posts[4],
      author: usman,
      content: "Middleware makes backend code much cleaner."
    },
    {
      post: posts[5],
      author: zara,
      content: "Sounds like a perfect study cafe."
    },
    {
      post: posts[6],
      author: ali,
      content: "Gaming breaks are necessary sometimes."
    },
    {
      post: posts[7],
      author: furqan,
      content: "Typography makes a huge difference in design."
    }
  ];

  const comments = [];

  for (const item of commentsData) {
    if (!item.post || !item.author) {
      continue;
    }

    const comment = await Comment.create({
      post: item.post._id,
      author: item.author._id,
      content: item.content,
      isDeleted: false
    });

    comments.push(comment);
  }

  for (const post of posts) {
    post.commentsCount = comments.filter(
      (comment) => comment.post.toString() === post._id.toString()
    ).length;

    await post.save({ validateBeforeSave: false });
  }

  console.log(`${comments.length} sample comments created.`);

  return comments;
};

const createLikes = async (posts, users) => {
  const likePairs = [
    [posts[0], getUser(users, "aliraza")],
    [posts[0], getUser(users, "ayesha")],
    [posts[0], getUser(users, "hamza")],
    [posts[1], getUser(users, "ayesha")],
    [posts[2], getUser(users, "furqan")],
    [posts[2], getUser(users, "usman")],
    [posts[3], getUser(users, "furqan")],
    [posts[3], getUser(users, "maham")],
    [posts[4], getUser(users, "furqan")],
    [posts[4], getUser(users, "usman")],
    [posts[5], getUser(users, "zara")],
    [posts[6], getUser(users, "hamza")],
    [posts[7], getUser(users, "furqan")],
    [posts[8], getUser(users, "furqan")],
    [posts[8], getUser(users, "zara")],
    [posts[9], getUser(users, "maham")]
  ];

  const likes = [];

  for (const [post, user] of likePairs) {
    if (!post || !user) {
      continue;
    }

    const like = await Like.create({
      post: post._id,
      user: user._id
    });

    likes.push(like);
  }

  for (const post of posts) {
    post.likesCount = likes.filter(
      (like) => like.post.toString() === post._id.toString()
    ).length;

    await post.save({ validateBeforeSave: false });
  }

  console.log(`${likes.length} sample likes created.`);

  return likes;
};

const createNotifications = async ({ posts, comments, users }) => {
  const furqan = getUser(users, "furqan");
  const ali = getUser(users, "aliraza");
  const ayesha = getUser(users, "ayesha");
  const hamza = getUser(users, "hamza");

  const notificationsData = [
    {
      receiver: furqan,
      sender: ali,
      type: "follow",
      message: "Ali Raza started following you"
    },
    {
      receiver: furqan,
      sender: ayesha,
      type: "like",
      post: posts[0],
      referenceId: posts[0]?._id,
      message: "Ayesha Khan liked your post"
    },
    {
      receiver: furqan,
      sender: hamza,
      type: "comment",
      post: posts[0],
      comment: comments[0],
      referenceId: comments[0]?._id,
      message: "Hamza Malik commented on your post"
    }
  ];

  const docs = notificationsData
    .filter((item) => item.receiver)
    .map((item) => ({
      receiver: item.receiver._id,
      sender: item.sender?._id || null,
      type: item.type,
      post: item.post?._id || null,
      comment: item.comment?._id || null,
      referenceId: item.referenceId || null,
      message: item.message,
      isRead: false
    }));

  if (docs.length > 0) {
    await Notification.insertMany(docs);
  }

  console.log(`${docs.length} sample notifications created.`);
};

const updateAllInterestCounters = async (interests) => {
  for (const interest of interests) {
    const userCount = await UserInterest.countDocuments({
      interest: interest._id
    });

    const postCount = await PostInterest.countDocuments({
      interest: interest._id
    });

    await NewInterestCounter.findOneAndUpdate(
      {
        interest: interest._id
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

  console.log("Interest counters updated.");
};

const seedPosts = async (users) => {
  const interests = await createDemoInterests();

  await createSampleFollows(users);
  await createUserInterests(users, interests);

  const posts = await createPosts(users);
  const comments = await createComments(posts, users);
  const likes = await createLikes(posts, users);

  await createNotifications({
    posts,
    comments,
    users
  });

  await updateAllInterestCounters(interests);

  return {
    interests,
    posts,
    comments,
    likes
  };
};

export default seedPosts;