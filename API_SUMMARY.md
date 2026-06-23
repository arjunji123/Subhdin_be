# API Summary

## 📊 Complete API Structure

### Authentication Layer
- `/auth/request-otp` - Request OTP (vendor or user)
- `/auth/verify-otp` - Verify OTP (vendor or user)

### Vendor APIs
- `GET /vendor/me` - Get vendor profile
- `PUT /vendor/me` - Update vendor profile
- `DELETE /vendor/me` - Delete vendor account
- `GET /vendor/services` - List services
- `POST /vendor/services` - Create service
- `PATCH /vendor/services/{id}` - Update service
- `DELETE /vendor/services/{id}` - Delete service
- `GET /vendor/offers` - List offers
- `POST /vendor/offers` - Create offer
- `PATCH /vendor/offers/{id}` - Update offer
- `DELETE /vendor/offers/{id}` - Delete offer
- `GET /vendor/reviews` - List reviews
- `POST /vendor/reviews` - Create review (customer)
- `GET /vendor/dashboard` - Get dashboard stats

### User APIs (NEW)
- `GET /user/me` - Get user profile
- `PUT /user/me` - Update user profile
- `DELETE /user/me` - Delete user account

### Analytics APIs
- `POST /analytics/events` - Track events (VIEW, CONTACT_REVEAL, WHATSAPP_CLICK, LEAD)

### Upload APIs
- `GET /uploads/signature` - Get Cloudinary upload signature

### Health
- `GET /health` - Health check

---

## 🔑 Required Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 🎯 User vs Vendor Authentication

### For Vendor:
```json
{
  "vendorId": "uuid",
  "role": "vendor"
}
```

### For User:
```json
{
  "userId": "uuid",
  "role": "user"
}
```

---

## 📱 Frontend Testing URLs

**Local:**
```
API: http://localhost:4000/api
Swagger: http://localhost:4000/api/swagger
Health: http://localhost:4000/api/health
```

**Production:**
```
API: https://subhdin-be.onrender.com/api
Swagger: https://subhdin-be.onrender.com/api/swagger
Health: https://subhdin-be.onrender.com/api/health
```

---

## 🗂️ Database Tables

```
User
├── id (UUID)
├── phone (unique)
├── isPhoneVerified
├── fullName
├── email
├── city
├── area
├── createdAt
└── updatedAt

Vendor
├── id (UUID)
├── phone (unique)
├── isPhoneVerified
├── businessName
├── ownerName
├── email
├── mobileNumber
├── address
├── city
├── area
├── mapLocationUrl
├── businessImages[]
├── status (PENDING, APPROVED, REJECTED, SUSPENDED)
├── createdAt
└── updatedAt

OtpSession
├── id (UUID)
├── phone
├── code
├── verified
├── expiresAt (5 minutes)
├── vendorId (FK)
└── createdAt

Service
├── id (UUID)
├── vendorId (FK)
├── category
├── serviceName
├── description
├── price
├── capacity
├── galleryImages[]
├── videoUrls[]
├── highlights[]
├── createdAt
└── updatedAt

Offer
├── id (UUID)
├── vendorId (FK)
├── title
├── description
├── discountPercent
├── startDate
├── endDate
├── isActive
├── createdAt
└── updatedAt

Review
├── id (UUID)
├── vendorId (FK)
├── userName
├── rating (1-5)
├── comment
└── createdAt

AnalyticsEvent
├── id (UUID)
├── vendorId (FK)
├── type (VIEW, CONTACT_REVEAL, WHATSAPP_CLICK, LEAD)
├── source (optional)
├── metadata (JSON)
└── createdAt
```

---

## ✅ Swagger Sections

The Swagger UI now has these main sections:

1. **Auth** - Authentication endpoints
2. **Vendor** - Vendor management (CRUD, services, offers, reviews, dashboard)
3. **User** - User management (NEW) ⭐
4. **Analytics** - Event tracking
5. **Uploads** - Cloudinary integration

---

## 🚀 Quick Start for Frontend Developers

### Step 1: Vendor Registration
```
POST /auth/request-otp
POST /auth/verify-otp (with role: "vendor")
GET /vendor/me
```

### Step 2: User Registration
```
POST /auth/request-otp
POST /auth/verify-otp (with role: "user")
GET /user/me
```

### Step 3: Create Services (Vendor only)
```
POST /vendor/services
GET /vendor/services
PATCH /vendor/services/{id}
DELETE /vendor/services/{id}
```

### Step 4: View Dashboard (Vendor only)
```
GET /vendor/dashboard
```

### Step 5: Track Analytics (Public)
```
POST /analytics/events
```

---

## 🛠️ Development Tips

1. **Always include Bearer token** in Authorization header for protected endpoints
2. **Phone format:** Must be +923001234567 (with country code)
3. **OTP expiry:** 5 minutes after request
4. **JWT expiry:** 7 days
5. **Error responses:** Check status code and message field
6. **Image uploads:** Use Cloudinary via `/uploads/signature` endpoint

---

## 📚 Documentation Files

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - Frontend integration guide with code examples
- [API_SUMMARY.md](./API_SUMMARY.md) - This file (quick reference)
