import env from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "strict" : "lax",
  maxAge: env.cookieExpiresDays * 24 * 60 * 60 * 1000
};

export default cookieOptions;