import type { PostgrestError } from "@supabase/supabase-js";
import { AppError } from "./app-error.js";

export const assertSupabase = <T>(
  data: T,
  error: PostgrestError | null,
  message: string,
  statusCode = 500,
) => {
  if (error) {
    throw new AppError(`${message}: ${error.message}`, statusCode, {
      code: error.code,
      details: error.details,
      hint: error.hint,
      info: error.details,
    });
  }

  return data;
};
