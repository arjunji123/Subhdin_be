import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

const supabaseUrl = new URL(env.SUPABASE_URL);
if (supabaseUrl.pathname.endsWith("/rest/v1") || supabaseUrl.pathname.includes("/rest/v1/")) {
  throw new Error(
    "Invalid SUPABASE_URL: use the Supabase project root URL (e.g. https://<project>.supabase.co), not the REST endpoint /rest/v1.",
  );
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});