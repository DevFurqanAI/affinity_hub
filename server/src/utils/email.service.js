import nodemailer from "nodemailer";

import env from "../config/env.js";

const hasSmtpConfig = () => {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
};

const hasBrevoConfig = () => {
  return Boolean(env.brevoApiKey && env.brevoSenderEmail);
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

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

const sendWithBrevoApi = async ({
  to,
  name,
  subject,
  textContent,
  htmlContent
}) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": env.brevoApiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: env.brevoSenderName,
        email: env.brevoSenderEmail
      },
      to: [
        {
          email: to,
          name
        }
      ],
      subject,
      textContent,
      htmlContent
    })
  });

  if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(
      `Brevo email request failed with status ${response.status}: ${errorDetails}`
    );
  }
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
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  const textContent = `Hello ${name}, your Affinity Hub OTP is ${otp}. It expires in ${expiryText}. ${ignoreMessage}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b;">
      <h2>${heading}</h2>
      <p>Hello ${safeName},</p>
      <p>${instruction}</p>
      <h1 style="letter-spacing: 4px;">${safeOtp}</h1>
      <p>This OTP expires in ${expiryText}.</p>
      <p>${ignoreMessage}</p>
    </div>
  `;

  /*
  |--------------------------------------------------------------------------
  | Brevo API Delivery
  |--------------------------------------------------------------------------
  | Works locally and on Render because it sends through HTTPS.
  |--------------------------------------------------------------------------
  */
  if (hasBrevoConfig()) {
    try {
      await sendWithBrevoApi({
        to,
        name,
        subject,
        textContent,
        htmlContent
      });

      return;
    } catch (error) {
      if (env.nodeEnv === "production") {
        throw error;
      }

      console.warn("Brevo email sending failed in development.");
      console.warn(error.message);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Optional Local SMTP Fallback
  |--------------------------------------------------------------------------
  */
  if (hasSmtpConfig() && env.nodeEnv !== "production") {
    try {
      const transporter = createTransporter();

      await transporter.sendMail({
        from: env.smtpFrom,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });

      return;
    } catch (error) {
      console.warn("SMTP email sending failed in development.");
      console.warn(error.message);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Production Protection
  |--------------------------------------------------------------------------
  */
  if (env.nodeEnv === "production") {
    throw new Error(
      "Brevo email API configuration is missing or email delivery failed in production"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Local Terminal Fallback
  |--------------------------------------------------------------------------
  */
  logOtpToTerminal({
    to,
    name,
    otp,
    purpose: terminalPurpose
  });
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