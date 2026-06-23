# Supabase Migration Guide

## 📋 Current Migration Status

**Migration File:** `supabase/migrations/20260606200206_new-migration.sql`

**Contains:**
- ✅ Vendor table
- ✅ User table (NEW)
- ✅ OtpSession table
- ✅ Service table
- ✅ Offer table
- ✅ AnalyticsEvent table
- ✅ Review table
- ✅ Triggers for updatedAt

---

## 🚀 Option 1: Run Via Supabase CLI (Recommended)

### Step 1: Install Supabase CLI
```bash
# macOS with Homebrew
brew install supabase/tap/supabase

# Or with npm
npm install -g supabase
```

### Step 2: Authenticate
```bash
supabase login
# Follow the prompts - you'll need your Supabase project URL and API key
```

### Step 3: Link Your Project
```bash
cd /Users/apple/Desktop/Personal/Subhdin_be
supabase link --project-ref <your-project-ref>
```

**Find project ref:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Copy the project ID from URL (e.g., `abcdef123456`)

### Step 4: Run Migration
```bash
supabase migration up
```

This will:
- Execute all migrations in `supabase/migrations/` folder
- Keep track of which migrations have been run
- Show success/failure status

### Check Status
```bash
supabase migration list
```

---

## 🔧 Option 2: Manual - Via Supabase Dashboard (Quickest for Now)

### Step 1: Go to Supabase Dashboard
1. Open [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**

### Step 2: Open Migration File
Copy entire content from: `supabase/migrations/20260606200206_new-migration.sql`

### Step 3: Paste & Execute
1. Click **New query**
2. Paste the entire SQL content
3. Click **Run** (or Cmd+Enter)

**⚠️ Important:**
- If tables already exist (Vendor, Service, etc.), the query will skip them due to `IF NOT EXISTS`
- Only new tables (User) and triggers will be created
- This is safe to run multiple times

### Step 4: Verify
After execution, check **Table Editor** to see all tables:
- Vendor ✅
- User ✅ (NEW)
- OtpSession ✅
- Service ✅
- Offer ✅
- AnalyticsEvent ✅
- Review ✅

---

## 🔄 Option 3: Smart Migration (If You Have Existing Data)

If you already have data in Vendor/Service tables:

```sql
-- Check if User table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'User'
);

-- If it returns false, run just the User table creation:
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

-- Add trigger for User table
CREATE TRIGGER user_updatedAt BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

---

## ✅ Step-by-Step: EASIEST WAY (Right Now)

### Step 1: Open Supabase Dashboard
```
https://app.supabase.com → Select Project → SQL Editor → New Query
```

### Step 2: Copy & Paste Full Migration
```sql
-- Copy entire content from:
supabase/migrations/20260606200206_new-migration.sql
```

### Step 3: Click Run
```
Press Cmd+Enter or click Run button
```

### Step 4: Check Status
Go to **Table Editor** and verify all tables are there

---

## 🐛 Troubleshooting

### Error: "Table already exists"
**Solution:** This is okay! The `IF NOT EXISTS` prevents re-creation. Just click Run again.

### Error: "Permission denied"
**Solution:** 
- Ensure you're logged in with admin role
- Check if your API key has table creation permissions

### Error: "Function already exists"
**Solution:** This is okay! The `CREATE OR REPLACE FUNCTION` updates it.

### Tables not appearing
**Solution:** 
- Refresh the page
- Check **Postgres** tab in SQL Editor
- Verify there are no error messages

### Need to verify migration ran?
```sql
-- Run this to check all tables exist:
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check User table structure:
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'User';
```

---

## 📊 What Gets Created

After running the migration:

### Tables (7 total)
```
1. Vendor - Vendor profiles
2. User - Customer profiles (NEW)
3. OtpSession - OTP codes
4. Service - Vendor services
5. Offer - Discounts/Offers
6. AnalyticsEvent - Event tracking
7. Review - Customer reviews
```

### Indexes (6 total)
- `idx_otp_phone_verified` - Fast OTP lookups
- `idx_service_vendor` - Fast service queries
- `idx_offer_vendor_active` - Fast offer queries
- `idx_analytics_vendor_type` - Fast analytics queries
- `idx_review_vendor` - Fast review queries

### Triggers (4 total)
- `vendor_updatedAt` - Auto-update vendor timestamp
- `user_updatedAt` - Auto-update user timestamp (NEW)
- `service_updatedAt` - Auto-update service timestamp
- `offer_updatedAt` - Auto-update offer timestamp

---

## 🎯 Quickest Path (5 minutes)

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy-paste the migration file content
5. Click Run
6. Done! ✅

---

## 🔐 Safety Notes

✅ **Safe to run multiple times** - Uses `IF NOT EXISTS`
✅ **Won't delete existing data** - Only creates missing tables
✅ **Backward compatible** - All tables include existing fields
✅ **No downtime** - Changes happen instantly on Supabase

---

## 📝 After Migration - Verify Everything

```bash
# Check database status
curl -X GET https://your-project.supabase.co/rest/v1/tables \
  -H "apikey: your-anon-key"

# Or use in your app
curl -X GET http://localhost:4000/api/health
# Should return: { "ok": true }
```

---

## ❓ FAQ

**Q: Do I need to run vendor and user migrations separately?**
A: No! One file contains both. Run it once and everything is created.

**Q: What if migration already ran?**
A: No problem! `IF NOT EXISTS` prevents errors. Safe to run again.

**Q: Will existing vendor data be deleted?**
A: No! We only CREATE IF NOT EXISTS. Existing data stays intact.

**Q: How do I know it worked?**
A: Check Table Editor - you should see all 7 tables listed.

**Q: Can I run it via CLI?**
A: Yes! Use `supabase migration up` (see Option 1)

**Q: Is there a rollback if something goes wrong?**
A: Supabase keeps migration history. You can roll back via dashboard.

---

## 🚀 Next Steps After Migration

1. ✅ Run migration (this guide)
2. ✅ Start backend: `npm run dev:api`
3. ✅ Test endpoints with Swagger: `http://localhost:4000/api/swagger`
4. ✅ Build frontend using integration guide
5. ✅ Test user registration: `/auth/request-otp` → `/auth/verify-otp`
6. ✅ Test vendor registration: Same endpoints, different role
7. ✅ Deploy to production when ready

---

## 📞 Need Help?

Check Supabase docs: https://supabase.com/docs/guides/database/migrations
