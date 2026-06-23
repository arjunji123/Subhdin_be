import { supabase } from "../../lib/supabase.js";
import { AppError } from "../../utils/app-error.js";
import { assertSupabase } from "../../utils/supabase-helper.js";
import type { UserProfileInput } from "@subhdin/shared";

export const getUserMe = async (userId: string) => {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("id", userId)
    .limit(1);

  assertSupabase(data, error, "Failed to query user");
  return data?.[0] ?? null;
};

export const updateUserMe = async (userId: string, payload: UserProfileInput) => {
  const { data, error } = await supabase
    .from("User")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  assertSupabase(data, error, "Failed to update user");
  return data;
};

export const deleteUserMe = async (userId: string) => {
  const { error: deleteError } = await supabase
    .from("User")
    .delete()
    .eq("id", userId);

  assertSupabase(null, deleteError, "Failed to delete user");
  return { message: "User account deleted successfully" };
};
