import { OAuth2Client } from "google-auth-library";

import env from "../config/env.js";
import ApiError from "./ApiError.js";

const googleClient = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

export const verifyGoogleCredential = async (credential) => {
  if (!env.googleClientId || !googleClient) {
    throw new ApiError(500, "Google OAuth is not configured");
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new ApiError(401, "Invalid Google credential");
    }

    return {
      providerId: payload.sub,
      email: payload.email,
      emailVerified: Boolean(payload.email_verified),
      name: payload.name || payload.email?.split("@")[0] || "Google User",
      avatar: payload.picture || ""
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Invalid Google credential");
  }
};