import type { ReviewInput } from "@subhdin/shared";

import { supabase } from "../../lib/supabase.js";
import { AppError } from "../../utils/app-error.js";
import { assertSupabase } from "../../utils/supabase-helper.js";

export const listReviews = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("Review")
    .select("id, userName, rating, comment, createdAt")
    .eq("vendorId", vendorId)
    .order("createdAt", { ascending: false });

  assertSupabase(data, error, "Failed to fetch reviews");
  return data;
};

export const createReview = async (vendorId: string, payload: ReviewInput, userName?: string) => {
  const { data, error } = await supabase
    .from("Review")
    .insert({
      vendorId,
      userName: userName ?? "Anonymous",
      rating: payload.rating,
      comment: payload.comment,
    })
    .select()
    .single();

  assertSupabase(data, error, "Failed to create review");
  return data;
};