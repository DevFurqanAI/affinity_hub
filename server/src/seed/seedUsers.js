import User from "../models/User.model.js";

export const demoUsersData = [
  {
    name: "Furqan Arshad",
    username: "furqan",
    email: "furqan@affinityhub.demo",
    password: "Demo@123456",
    bio: "Computer science learner exploring MERN stack, UI design, and clean code.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  },
  {
    name: "Ali Raza",
    username: "aliraza",
    email: "ali@affinityhub.demo",
    password: "Demo@123456",
    bio: "Fitness lover, cricket fan, and web development learner.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  },
  {
    name: "Ayesha Khan",
    username: "ayesha",
    email: "ayesha@affinityhub.demo",
    password: "Demo@123456",
    bio: "Sharing study tips, productivity ideas, and daily learning moments.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  },
  {
    name: "Hamza Malik",
    username: "hamza",
    email: "hamza@affinityhub.demo",
    password: "Demo@123456",
    bio: "Tech enthusiast interested in AI, startups, and backend engineering.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  },
  {
    name: "Maham Noor",
    username: "maham",
    email: "maham@affinityhub.demo",
    password: "Demo@123456",
    bio: "Food, travel, photography, and little daily stories.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  },
  {
    name: "Usman Tariq",
    username: "usman",
    email: "usman@affinityhub.demo",
    password: "Demo@123456",
    bio: "Gaming, football, music, and backend engineering.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  },
  {
    name: "Zara Ahmed",
    username: "zara",
    email: "zara@affinityhub.demo",
    password: "Demo@123456",
    bio: "Art, design, lifestyle, and creative experiments.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  },
  {
    name: "Reported Demo User",
    username: "reporteduser",
    email: "reported@affinityhub.demo",
    password: "Demo@123456",
    bio: "Demo account used for admin moderation and appeal workflow.",
    authProvider: "local",
    role: "user",
    status: "active",
    isVerified: true,
    profileSetupCompleted: true,
    interestsSetupCompleted: true
  }
];

const seedUsers = async () => {
  const users = [];

  for (const userData of demoUsersData) {
    const user = await User.create(userData);
    users.push(user);
  }

  console.log(`${users.length} demo users created.`);
  console.log("Demo user password for all normal users: Demo@123456");

  return users;
};

export default seedUsers;