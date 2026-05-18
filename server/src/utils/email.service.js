import nodemailer from "nodemailer";

import env from "../config/env.js";

const hasSmtpConfig = () => {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
};

const logOtpToTerminal = ({ to, name, otp }) => {
  const expiryText = `${env.otpExpiresMinutes} minutes`;

  console.log("");
  console.log("========================================");
  console.log("Affinity Hub Email Verification OTP");
  console.log(`To: ${to}`);
  console.log(`Name: ${name}`);
  console.log(`OTP: ${otp}`);
  console.log(`Expires in: ${expiryText}`);
  console.log("========================================");
  console.log("");
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

export const sendVerificationOtpEmail = async ({ to, name, otp }) => {
  const expiryText = `${env.otpExpiresMinutes} minutes`;

  /*
  |--------------------------------------------------------------------------
  | Local Development Fallback
  |--------------------------------------------------------------------------
  | If SMTP is missing in development, do not break registration.
  | Just print the OTP in terminal.
  */
  if (!hasSmtpConfig()) {
    if (env.nodeEnv === "production") {
      throw new Error("SMTP configuration is missing in production");
    }

    logOtpToTerminal({ to, name, otp });
    return;
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: env.smtpFrom,
      to,
      subject: "Verify your Affinity Hub account",
      text: `Hello ${name}, your Affinity Hub verification OTP is ${otp}. It expires in ${expiryText}.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify your Affinity Hub account</h2>
          <p>Hello ${name},</p>
          <p>Your email verification OTP is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP expires in ${expiryText}.</p>
          <p>If you did not create an account, you can ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Development Safety
    |--------------------------------------------------------------------------
    | Bad SMTP credentials should not crash local registration.
    | For production, still throw the real error.
    */
    if (env.nodeEnv === "production") {
      throw error;
    }

    console.warn("SMTP email sending failed in development.");
    console.warn(error.message);

    logOtpToTerminal({ to, name, otp });
  }
};