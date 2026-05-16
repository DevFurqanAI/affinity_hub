import env from "../config/env.js";

const cookieExpiresDays = Number(env.cookieExpiresDays) || 7;

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: cookieExpiresDays * 24 * 60 * 60 * 1000,
  path: "/"
};

export default cookieOptions;