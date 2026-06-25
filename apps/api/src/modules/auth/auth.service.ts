import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../../config/env.js";
import { supabase } from "../../lib/supabase.js";
import { sendOtp } from "../../services/otp-service.js";
import { AppError } from "../../utils/app-error.js";
import { assertSupabase } from "../../utils/supabase-helper.js";
import type { UserProfileInput, VendorProfileInput } from "@subhdin/shared";

type RequestOtpInput = {
  phone: string;
};

type VerifyOtpInput = {
  phone: string;
  code: string;
  role?: "user" | "vendor";
} & Partial<VendorProfileInput> &
  Partial<UserProfileInput>;

const OTP_EXPIRY_MINUTES = 5;

async function findVendorByPhone(phone: string) {
  const { data, error } = await supabase
    .from("Vendor")
    .select("*")
    .eq("phone", phone)
    .limit(1);

  assertSupabase(data, error, "Failed to query vendor");
  return data?.[0] ?? null;
}

async function findUserByPhone(phone: string) {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("phone", phone)
    .limit(1);

  assertSupabase(data, error, "Failed to query user");
  return data?.[0] ?? null;
}

type AuthProfilePayload = Partial<VendorProfileInput> & Partial<UserProfileInput>;

function buildVendorProfilePayload(profile: AuthProfilePayload): Partial<VendorProfileInput> {
  const payload: Partial<VendorProfileInput> = {};
  if (profile.businessName !== undefined) payload.businessName = profile.businessName;
  if (profile.ownerName !== undefined) payload.ownerName = profile.ownerName;
  if (profile.mobileNumber !== undefined) payload.mobileNumber = profile.mobileNumber;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.address !== undefined) payload.address = profile.address;
  if (profile.city !== undefined) payload.city = profile.city;
  if (profile.area !== undefined) payload.area = profile.area;
  if (profile.mapLocationUrl !== undefined) payload.mapLocationUrl = profile.mapLocationUrl;
  if (profile.businessImages !== undefined) payload.businessImages = profile.businessImages;
  return payload;
}

function buildUserProfilePayload(profile: AuthProfilePayload): Partial<UserProfileInput> {
  const payload: Partial<UserProfileInput> = {};
  if (profile.fullName !== undefined) payload.fullName = profile.fullName;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.city !== undefined) payload.city = profile.city;
  if (profile.area !== undefined) payload.area = profile.area;
  return payload;
}

async function createVendor(phone: string, profile: AuthProfilePayload = {}) {
  const now = new Date().toISOString();
  const { data: vendor, error } = await supabase
    .from("Vendor")
    .insert({
      id: randomUUID(),
      phone,
      isPhoneVerified: true,
      createdAt: now,
      updatedAt: now,
      ...buildVendorProfilePayload(profile),
    })
    .select("*")
    .single();

  assertSupabase(vendor, error, "Failed to create vendor");
  return vendor;
}

async function createUser(phone: string, profile: AuthProfilePayload = {}) {
  const now = new Date().toISOString();
  const { data: user, error } = await supabase
    .from("User")
    .insert({
      id: randomUUID(),
      phone,
      isPhoneVerified: true,
      createdAt: now,
      updatedAt: now,
      ...buildUserProfilePayload(profile),
    })
    .select("*")
    .single();

  assertSupabase(user, error, "Failed to create user");
  return user;
}

export const requestOtp = async ({ phone }: RequestOtpInput) => {
  const code = await sendOtp(phone);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { data: sessionData, error: sessionError } = await supabase.from("OtpSession").insert({
    id: randomUUID(),
    phone,
    code,
    expiresAt,
  });

  assertSupabase(sessionData, sessionError, "Failed to save OTP session");

  return {
    message: "OTP sent successfully",
    ...(env.NODE_ENV === "development" ? { debugCode: code } : {}),
  };
};

export const verifyOtp = async ({ phone, code, role, ...profile }: VerifyOtpInput) => {
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

  const { data: verifiedSession, error: sessionUpdateError } = await supabase
    .from("OtpSession")
    .update({ verified: true })
    .eq("id", latestSession.id);
  assertSupabase(verifiedSession, sessionUpdateError, "Failed to mark OTP as verified");

  const vendor = await findVendorByPhone(phone);
  const user = await findUserByPhone(phone);

  let selectedRole = role;
  if (!selectedRole) {
    if (vendor && !user) {
      selectedRole = "vendor";
    } else if (user && !vendor) {
      selectedRole = "user";
    } else if (vendor && user) {
      throw new AppError("Multiple accounts found for this phone. Please specify role.", 400);
    } else {
      throw new AppError("Role is required for new registration", 400);
    }
  } else {
    // Role explicitly provided – prevent cross-registration
    if (selectedRole === "vendor" && !vendor && user) {
      throw new AppError(
        "This phone number is already registered as a user. Cannot register as vendor.",
        409,
      );
    }
    if (selectedRole === "user" && !user && vendor) {
      throw new AppError(
        "This phone number is already registered as a vendor. Cannot register as user.",
        409,
      );
    }
  }

  if (selectedRole === "vendor") {
    const account = vendor ?? await createVendor(phone, profile as Partial<VendorProfileInput>);
    if (!account) throw new AppError("Vendor not found after verify", 500);

    const updatePayload: Partial<VendorProfileInput> & { isPhoneVerified: boolean } = {
      isPhoneVerified: true,
    };

    if (profile.businessName !== undefined) updatePayload.businessName = profile.businessName;
    if (profile.ownerName !== undefined) updatePayload.ownerName = profile.ownerName;
    if (profile.mobileNumber !== undefined) updatePayload.mobileNumber = profile.mobileNumber;
    if (profile.email !== undefined) updatePayload.email = profile.email;
    if (profile.address !== undefined) updatePayload.address = profile.address;
    if (profile.city !== undefined) updatePayload.city = profile.city;
    if (profile.area !== undefined) updatePayload.area = profile.area;
    if (profile.mapLocationUrl !== undefined) updatePayload.mapLocationUrl = profile.mapLocationUrl;
    if (profile.businessImages !== undefined) updatePayload.businessImages = profile.businessImages;

    const { data: updatedVendor, error: updateError } = await supabase
      .from("Vendor")
      .update(updatePayload)
      .eq("id", account.id)
      .select("*")
      .single();

    assertSupabase(updatedVendor, updateError, "Failed to update vendor");

    const token = jwt.sign({ vendorId: updatedVendor.id, role: "vendor" }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return {
      message: "OTP verified",
      token,
      user: {
        id: updatedVendor.id,
        role: "vendor",
        name: updatedVendor.businessName ?? updatedVendor.ownerName ?? "",
        isProfileComplete: Boolean(updatedVendor.businessName || updatedVendor.ownerName),
      },
    };
  }

  const account = user ?? await createUser(phone, profile as Partial<UserProfileInput>);
  if (!account) throw new AppError("User not found after verify", 500);

  const updatePayload: Partial<UserProfileInput> & { isPhoneVerified: boolean } = {
    isPhoneVerified: true,
  };

  if (profile.fullName !== undefined) updatePayload.fullName = profile.fullName;
  if (profile.email !== undefined) updatePayload.email = profile.email;
  if (profile.city !== undefined) updatePayload.city = profile.city;
  if (profile.area !== undefined) updatePayload.area = profile.area;

  const { data: updatedUser, error: updateError } = await supabase
    .from("User")
    .update(updatePayload)
    .eq("id", account.id)
    .select("*")
    .single();

  assertSupabase(updatedUser, updateError, "Failed to update user");

  const token = jwt.sign({ userId: updatedUser.id, role: "user" }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    message: "OTP verified",
    token,
    user: {
      id: updatedUser.id,
      role: "user",
      name: updatedUser.fullName ?? "",
      isProfileComplete: Boolean(updatedUser.fullName),
    },
  };
};
