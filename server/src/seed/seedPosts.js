import Interest from "../models/Interest.model.js";
import UserInterest from "../models/UserInterest.model.js";
import PostInterest from "../models/PostInterest.model.js";
import NewInterestCounter from "../models/NewInterestCounter.model.js";
import Post from "../models/Post.model.js";
import Comment from "../models/Comment.model.js";
import Like from "../models/Like.model.js";

const interestData = [
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
    zara: ["art", "music", "travel"]
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
    await UserInterest.insertMany(docs, {
      ordered: false
    });
  }

  console.log("Sample user interests created.");
};

const createPosts = async (users) => {
  const postsData = [
    {
      author: getUser(users, "furqan"),
      caption:
        "Started polishing the Affinity Hub frontend today. Clean spacing and responsive UI make such a big difference!",
      visibility: "public"
    },
    {
      author: getUser(users, "furqan"),
      caption:
        "DSA revision mode is on. Binary search trees and AVL rotations finally feel easier now.",
      visibility: "followers"
    },
    {
      author: getUser(users, "aliraza"),
      caption:
        "Morning workout complete. Consistency beats motivation every single time.",
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
        "Built a clean Express middleware today. Small reusable utilities save so much time later.",
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
        "Late night gaming session with friends. Sometimes a break is also productivity.",
      visibility: "public"
    },
    {
      author: getUser(users, "zara"),
      caption:
        "Working on a new poster design. Simple colors, clean typography, and lots of white space.",
      visibility: "public"
    },
    {
      author: getUser(users, "hamza"),
      caption:
        "Startup idea: a student collaboration platform for group projects, deadlines, and peer review.",
      visibility: "public"
    },
    {
      author: getUser(users, "ayesha"),
      caption:
        "Weekend travel plan: explore a quiet place, take photos, and reset for next week.",
      visibility: "public"
    }
  ];

  const docs = postsData
    .filter((post) => post.author)
    .map((post) => ({
      author: post.author._id,
      caption: post.caption,
      visibility: post.visibility,
      media: {
        url: "",
        publicId: ""
      },
      mediaType: "none",
      likesCount: 0,
      commentsCount: 0,
      isDeleted: false
    }));

  const posts = await Post.insertMany(docs);

  console.log(`${posts.length} sample posts created.`);

  return posts;
};

const createPostInterests = async (posts, interests) => {
  const postInterestNames = [
    ["technology", "education"],
    ["education", "technology"],
    ["fitness", "sports"],
    ["education"],
    ["technology", "business"],
    ["food", "travel"],
    ["gaming", "music"],
    ["art"],
    ["business", "technology"],
    ["travel", "art"]
  ];

  const docs = [];

  posts.forEach((post, index) => {
    const names = postInterestNames[index] || [];

    names.forEach((name) => {
      const interest = getInterest(interests, name);

      if (interest) {
        docs.push({
          post: post._id,
          interest: interest._id
        });
      }
    });
  });

  if (docs.length > 0) {
    await PostInterest.insertMany(docs, {
      ordered: false
    });
  }

  console.log("Sample post interests created.");
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
      content: "This is actually so helpful for exams."
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

  const docs = commentsData
    .filter((comment) => comment.post && comment.author)
    .map((comment) => ({
      post: comment.post._id,
      author: comment.author._id,
      content: comment.content,
      isDeleted: false
    }));

  const comments = await Comment.insertMany(docs);

  for (const post of posts) {
    const commentsCount = comments.filter(
      (comment) => comment.post.toString() === post._id.toString()
    ).length;

    post.commentsCount = commentsCount;
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

  const docs = likePairs
    .filter(([post, user]) => post && user)
    .map(([post, user]) => ({
      post: post._id,
      user: user._id
    }));

  const likes = await Like.insertMany(docs, {
    ordered: false
  });

  for (const post of posts) {
    const likesCount = likes.filter(
      (like) => like.post.toString() === post._id.toString()
    ).length;

    post.likesCount = likesCount;
    await post.save({ validateBeforeSave: false });
  }

  console.log(`${likes.length} sample likes created.`);
};

const updateInterestCounters = async (interests) => {
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

  await createPostInterests(posts, interests);
  await createComments(posts, users);
  await createLikes(posts, users);
  await updateInterestCounters(interests);

  return {
    interests,
    posts
  };
};

export default seedPosts;