import twilio from "twilio";
import { env } from "../config/env.js";

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phone: string): Promise<string> {
  const code = generateCode();

  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    // In dev/test, don't send real SMS; just log the code
    console.log(`[OTP] Code for ${phone}: ${code}`);
    return code;
  }

  await client.messages.create({
    body: `Your Subhdin verification code is ${code}. Enter it to complete setup and access your account.`,
    from: env.TWILIO_PHONE_NUMBER,
    to: phone,
  });

  return code;
}

export async function sendCustomSms(phone: string, message: string): Promise<void> {
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    console.log(`[SMS] To ${phone}: ${message}`);
    return;
  }

  await client.messages.create({
    body: message,
    from: env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}