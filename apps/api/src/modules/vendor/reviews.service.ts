import type { ReviewInput } from "@shaadihub/shared";

import { supabase } from "../../lib/supabase.js";
import { AppError } from "../../utils/app-error.js";

export const listReviews = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("Review")
    .select("id, userName, rating, comment, createdAt")
    .eq("vendorId", vendorId)
    .order("createdAt", { ascending: false });

  if (error) throw new AppError("Failed to fetch reviews", 500);
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

  if (error) throw new AppError("Failed to create review", 500);
  return data;
};