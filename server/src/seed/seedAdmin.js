import User from "../models/User.model.js";

export const demoAdminData = {
  name: "Affinity Admin",
  username: "admin",
  email: "admin@affinityhub.demo",
  password: "Admin@123456",
  bio: "Platform administrator for Affinity Hub demo environment.",
  authProvider: "local",
  role: "admin",
  status: "active",
  isVerified: true,
  profileSetupCompleted: true,
  interestsSetupCompleted: true
};

const seedAdmin = async () => {
  const admin = await User.create(demoAdminData);

  console.log("Admin user created:");
  console.log(`Email: ${demoAdminData.email}`);
  console.log(`Password: ${demoAdminData.password}`);

  return admin;
};

export default seedAdmin;