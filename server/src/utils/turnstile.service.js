import env from "../config/env.js";
import ApiError from "./ApiError.js";

export const verifyTurnstileToken = async (token, remoteIp) => {
  if (!token) {
    return false;
  }

  if (!env.turnstileSecretKey) {
    if (env.nodeEnv === "production") {
      throw new ApiError(500, "Turnstile secret key is missing");
    }

    console.warn(
      "TURNSTILE_SECRET_KEY is missing. Allowing CAPTCHA in development only."
    );

    return true;
  }

  const formData = new URLSearchParams();

  formData.append("secret", env.turnstileSecretKey);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData
    }
  );

  const result = await response.json();

  return Boolean(result.success);
};