import jwt from "jsonwebtoken";
import env from "../config/env.js";

const validateJwtSecrets = () => {
  if (!env.jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET is missing in environment variables");
  }

  if (!env.jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is missing in environment variables");
  }
};

export const generateAccessToken = (userId) => {
  validateJwtSecrets();

  return jwt.sign(
    {
      userId
    },
    env.jwtAccessSecret,
    {
      expiresIn: env.jwtAccessExpiresIn
    }
  );
};

export const generateRefreshToken = (userId) => {
  validateJwtSecrets();

  return jwt.sign(
    {
      userId
    },
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshExpiresIn
    }
  );
};

export const generateAuthTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken
  };
};