import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { supabase } from "../../lib/supabase.js";
import { sendOtp } from "../../services/otp-service.js";
import { AppError } from "../../utils/app-error.js";
import { assertSupabase } from "../../utils/supabase-helper.js";

type RequestOtpInput = {
  phone: string;
};

type VerifyOtpInput = {
  phone: string;
  code: string;
};

type RequestOtpMode = "signup" | "login";

const OTP_EXPIRY_MINUTES = 5;

async function findVendorByPhone(phone: string) {
  const { data, error } = await supabase
    .from("Vendor")
    .select("id")
    .eq("phone", phone)
    .limit(1);

  assertSupabase(data, error, "Failed to query vendor");
  return data?.[0] ?? null;
}

async function createVendor(phone: string) {
  const { data: vendor, error } = await supabase
    .from("Vendor")
    .insert({ phone, businessImages: [] })
    .select("id")
    .single();

  assertSupabase(vendor, error, "Failed to create vendor");
  return vendor;
}

export const requestOtp = async (
  { phone }: RequestOtpInput,
  mode: RequestOtpMode = "signup",
) => {
  let vendor = await findVendorByPhone(phone);

  if (mode === "login") {
    if (!vendor) {
      throw new AppError("Vendor not found", 404);
    }
  } else if (!vendor) {
    vendor = await createVendor(phone);
  }

  // Generate & send OTP
  const code = await sendOtp(phone);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { data: sessionData, error: sessionError } = await supabase.from("OtpSession").insert({
    phone,
    code,
    expiresAt,
    vendorId: vendor?.id,
  });

  assertSupabase(sessionData, sessionError, "Failed to save OTP session");

  return {
    message: "OTP sent successfully",
    ...(env.NODE_ENV === "development" ? { debugCode: code } : {}),
  };
};

export const verifyOtp = async ({ phone, code }: VerifyOtpInput) => {
  // Find latest unverified session
  const { data: sessions, error: findError } = await supabase
    .from("OtpSession")
    .select("*")
    .eq("phone", phone)
    .eq("verified", false)
    .order("createdAt", { ascending: false })
    .limit(1);

  assertSupabase(sessions, findError, "Failed to find OTP session");

  const latestSession = sessions?.[0];
  if (!latestSession) throw new AppError("OTP session not found", 404);

  if (new Date(latestSession.expiresAt).getTime() < Date.now()) {
    throw new AppError("OTP expired", 400);
  }

  if (latestSession.code !== code) {
    throw new AppError("Invalid OTP", 401);
  }

  // Mark session verified
  const { data: verifiedSession, error: sessionUpdateError } = await supabase
    .from("OtpSession")
    .update({ verified: true })
    .eq("id", latestSession.id);
  assertSupabase(verifiedSession, sessionUpdateError, "Failed to mark OTP as verified");

  // Mark vendor phone verified
  const { data: vendor, error: updateError } = await supabase
    .from("Vendor")
    .update({ isPhoneVerified: true })
    .eq("phone", phone)
    .select("id")
    .single();

  assertSupabase(vendor, updateError, "Failed to verify vendor");
  if (!vendor) throw new AppError("Vendor not found", 404);

  const token = jwt.sign({ vendorId: vendor.id }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    message: "OTP verified",
    token,
  };
};
