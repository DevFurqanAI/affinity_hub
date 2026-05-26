import dotenv from "dotenv";

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGO_URI,

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  cookieExpiresDays: process.env.COOKIE_EXPIRES_DAYS || 7,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || "affinity-hub",

  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom:
    process.env.SMTP_FROM || "Affinity Hub <no-reply@affinityhub.com>",

  brevoApiKey: process.env.BREVO_API_KEY,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL,
  brevoSenderName: process.env.BREVO_SENDER_NAME || "Affinity Hub",

  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,

  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES) || 10,
  otpResendCooldownSeconds:
    Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,

  googleClientId: process.env.GOOGLE_CLIENT_ID
};

export default env;