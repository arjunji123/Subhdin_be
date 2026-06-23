-- Create tables for ShaadiHub
-- Run this in Supabase SQL editor or via supabase migration

-- Enable UUID generation if not already
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendor table
CREATE TABLE IF NOT EXISTS "Vendor" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone" TEXT UNIQUE NOT NULL,
  "isPhoneVerified" BOOLEAN DEFAULT false,
  "businessName" TEXT,
  "ownerName" TEXT,
  "mobileNumber" TEXT,
  "email" TEXT,
  "address" TEXT,
  "city" TEXT,
  "area" TEXT,
  "mapLocationUrl" TEXT,
  "businessImages" TEXT[] DEFAULT '{}',
  "status" TEXT DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone" TEXT UNIQUE NOT NULL,
  "isPhoneVerified" BOOLEAN DEFAULT false,
  "fullName" TEXT,
  "email" TEXT,
  "city" TEXT,
  "area" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- OTP Session table
CREATE TABLE IF NOT EXISTS "OtpSession" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "verified" BOOLEAN DEFAULT false,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "vendorId" TEXT REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone_verified ON "OtpSession" ("phone", "verified");

-- Service table
CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "category" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "capacity" INTEGER,
  "galleryImages" TEXT[] DEFAULT '{}',
  "videoUrls" TEXT[] DEFAULT '{}',
  "highlights" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_vendor ON "Service" ("vendorId", "category");

-- Offer table
CREATE TABLE IF NOT EXISTS "Offer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "discountPercent" INTEGER NOT NULL,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_offer_vendor_active ON "Offer" ("vendorId", "isActive");

-- Analytics Event table
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL CHECK ("type" IN ('VIEW', 'CONTACT_REVEAL', 'WHATSAPP_CLICK', 'LEAD')),
  "source" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_vendor_type ON "AnalyticsEvent" ("vendorId", "type");

-- Review table
CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "userName" TEXT DEFAULT 'Anonymous',
  "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_vendor ON "Review" ("vendorId");

-- Trigger to auto-update "updatedAt"
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendor_updatedAt BEFORE UPDATE ON "Vendor" FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER user_updatedAt BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER service_updatedAt BEFORE UPDATE ON "Service" FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER offer_updatedAt BEFORE UPDATE ON "Offer" FOR EACH ROW EXECUTE FUNCTION update_timestamp();
