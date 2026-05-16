import User from "../models/User.model.js";

export const demoUsersData = [
  {
    name: "Furqan Arshad",
    username: "furqan",
    email: "furqan@affinityhub.demo",
    password: "Demo@123456",
    bio: "Computer science student exploring MERN stack and UI design.",
    role: "user",
    status: "active",
    isVerified: true
  },
  {
    name: "Ali Raza",
    username: "aliraza",
    email: "ali@affinityhub.demo",
    password: "Demo@123456",
    bio: "Fitness lover, cricket fan, and web development learner.",
    role: "user",
    status: "active",
    isVerified: true
  },
  {
    name: "Ayesha Khan",
    username: "ayesha",
    email: "ayesha@affinityhub.demo",
    password: "Demo@123456",
    bio: "Sharing study tips, productivity ideas, and campus memories.",
    role: "user",
    status: "active",
    isVerified: true
  },
  {
    name: "Hamza Malik",
    username: "hamza",
    email: "hamza@affinityhub.demo",
    password: "Demo@123456",
    bio: "Tech enthusiast interested in AI, startups, and clean code.",
    role: "user",
    status: "active",
    isVerified: true
  },
  {
    name: "Maham Noor",
    username: "maham",
    email: "maham@affinityhub.demo",
    password: "Demo@123456",
    bio: "Food, travel, photography, and little daily stories.",
    role: "user",
    status: "active",
    isVerified: true
  },
  {
    name: "Usman Tariq",
    username: "usman",
    email: "usman@affinityhub.demo",
    password: "Demo@123456",
    bio: "Gaming, football, music, and backend engineering.",
    role: "user",
    status: "active",
    isVerified: true
  },
  {
    name: "Zara Ahmed",
    username: "zara",
    email: "zara@affinityhub.demo",
    password: "Demo@123456",
    bio: "Art, design, lifestyle, and creative experiments.",
    role: "user",
    status: "active",
    isVerified: true
  }
];

const seedUsers = async () => {
  const users = await User.insertMany(demoUsersData);

  console.log(`${users.length} normal demo users created.`);
  console.log("Demo user password for all normal users: Demo@123456");

  return users;
};

export default seedUsers;