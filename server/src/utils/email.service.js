import nodemailer from "nodemailer";

import env from "../config/env.js";

const hasSmtpConfig = () => {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
};

const logOtpToTerminal = ({ to, name, otp, purpose }) => {
  const expiryText = `${env.otpExpiresMinutes} minutes`;

  console.log("");
  console.log("========================================");
  console.log(`Affinity Hub ${purpose}`);
  console.log(`To: ${to}`);
  console.log(`Name: ${name}`);
  console.log(`OTP: ${otp}`);
  console.log(`Expires in: ${expiryText}`);
  console.log("========================================");
  console.log("");
};

const sendOtpEmail = async ({
  to,
  name,
  otp,
  subject,
  heading,
  instruction,
  ignoreMessage,
  terminalPurpose
}) => {
  const expiryText = `${env.otpExpiresMinutes} minutes`;

  /*
  |--------------------------------------------------------------------------
  | Local Development Fallback
  |--------------------------------------------------------------------------
  | If SMTP is missing in development, print OTP in the terminal.
  |--------------------------------------------------------------------------
  */
  if (!hasSmtpConfig()) {
    if (env.nodeEnv === "production") {
      throw new Error("SMTP configuration is missing in production");
    }

    logOtpToTerminal({
      to,
      name,
      otp,
      purpose: terminalPurpose
    });

    return;
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      text: `Hello ${name}, your Affinity Hub OTP is ${otp}. It expires in ${expiryText}. ${ignoreMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b;">
          <h2>${heading}</h2>
          <p>Hello ${name},</p>
          <p>${instruction}</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP expires in ${expiryText}.</p>
          <p>${ignoreMessage}</p>
        </div>
      `
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Development Safety
    |--------------------------------------------------------------------------
    | Bad SMTP credentials should not block local development.
    |--------------------------------------------------------------------------
    */
    if (env.nodeEnv === "production") {
      throw error;
    }

    console.warn("SMTP email sending failed in development.");
    console.warn(error.message);

    logOtpToTerminal({
      to,
      name,
      otp,
      purpose: terminalPurpose
    });
  }
};

export const sendVerificationOtpEmail = async ({ to, name, otp }) => {
  return sendOtpEmail({
    to,
    name,
    otp,
    subject: "Verify your Affinity Hub account",
    heading: "Verify your Affinity Hub account",
    instruction: "Your email verification OTP is:",
    ignoreMessage: "If you did not create an account, you can ignore this email.",
    terminalPurpose: "Email Verification OTP"
  });
};

export const sendPasswordResetOtpEmail = async ({ to, name, otp }) => {
  return sendOtpEmail({
    to,
    name,
    otp,
    subject: "Reset your Affinity Hub password",
    heading: "Reset your Affinity Hub password",
    instruction: "Your password reset OTP is:",
    ignoreMessage:
      "If you did not request a password reset, you can ignore this email and your password will remain unchanged.",
    terminalPurpose: "Password Reset OTP"
  });
};