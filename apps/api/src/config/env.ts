import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const runtimeEnv = { ...process.env };
if (runtimeEnv.NODE_ENV === "test") {
  runtimeEnv.SUPABASE_URL ??= "https://xxxxxxxxxxxx.supabase.co";
  runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??= "test-key";
  runtimeEnv.JWT_SECRET ??= "test-secret-should-be-long-enough";
  runtimeEnv.TWILIO_ACCOUNT_SID ??= "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  runtimeEnv.TWILIO_AUTH_TOKEN ??= "test-token";
  runtimeEnv.TWILIO_PHONE_NUMBER ??= "+15005550006";
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  SUPABASE_URL: z.string().url().refine((value) => {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.pathname === "/" &&
      parsed.hostname.endsWith(".supabase.co")
    );
  }, {
    message: "SUPABASE_URL must be the Supabase project root URL, e.g. https://<project>.supabase.co",
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(runtimeEnv);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Failed to load environment variables");
}

export const env = parsed.data;
