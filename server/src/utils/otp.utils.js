import bcrypt from "bcryptjs";

import env from "../config/env.js";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 12);
};

export const compareOtp = async (otp, hashedOtp) => {
  return bcrypt.compare(otp, hashedOtp);
};

export const getOtpExpiryDate = () => {
  return new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
};