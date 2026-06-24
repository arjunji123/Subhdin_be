# Subhdin API Documentation

**Base URL:**
- Local: `http://localhost:4000/api`
- Production: `https://subhdin-be.onrender.com/api`

---

## 🔐 Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### JWT Token Structure
```json
{
  "vendorId": "uuid",        // for vendor
  "userId": "uuid",          // for user
  "role": "vendor|user",     // role type
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 📱 Auth APIs

### 1. Request OTP
**Endpoint:** `POST /auth/request-otp`

**Description:** Send OTP to phone number for signup or login (works for both vendor and user)

**Request Body:**
```json
{
  "phone": "+923001234567"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP sent successfully",
  "debugCode": "123456"  // only in development mode
}
```

**Errors:**
- 400: Invalid phone format
- 500: OTP service failure

---

### 2. Verify OTP
**Endpoint:** `POST /auth/verify-otp`

**Description:** Verify OTP and get JWT token for vendor or user

**Request Body:**

**For New Vendor Registration:**
```json
{
  "phone": "+923001234567",
  "code": "123456",
  "role": "vendor",
  "businessName": "ABC Wedding Planner",
  "ownerName": "Ali Khan",
  "email": "ali@example.com",
  "mobileNumber": "+923001234567",
  "address": "123 Main St",
  "city": "Karachi",
  "area": "Defence",
  "mapLocationUrl": "https://maps.google.com/...",
  "businessImages": ["https://cloudinary.com/image1.jpg"]
}
```

**For Existing Vendor Login:**
```json
{
  "phone": "+923001234567",
  "code": "123456",
  "role": "vendor"
}
```

**For New User Registration:**
```json
{
  "phone": "+923001234567",
  "code": "123456",
  "role": "user",
  "fullName": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "city": "Lahore",
  "area": "Gulberg"
}
```

**For Existing User Login:**
```json
{
  "phone": "+923001234567",
  "code": "123456",
  "role": "user"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP verified",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "vendor",
    "name": "ABC Wedding Planner",
    "isProfileComplete": true
  }
}
```

**Errors:**
- 400: OTP expired, Invalid OTP, Multiple accounts found for phone, Role required for new registration
- 401: Invalid OTP
- 404: OTP session not found

---

## 👥 Vendor APIs

All vendor endpoints require `Authorization: Bearer <vendor_jwt_token>`

### 1. Get Vendor Profile
**Endpoint:** `GET /vendor/me`

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "+923001234567",
  "isPhoneVerified": true,
  "businessName": "ABC Wedding Planner",
  "ownerName": "Ali Khan",
  "mobileNumber": "+923001234567",
  "email": "ali@example.com",
  "address": "123 Main St",
  "city": "Karachi",
  "area": "Defence",
  "mapLocationUrl": "https://maps.google.com/...",
  "businessImages": ["https://cloudinary.com/image1.jpg"],
  "status": "PENDING",
  "createdAt": "2026-06-23T10:30:00Z",
  "updatedAt": "2026-06-23T10:30:00Z"
}
```

**Errors:**
- 401: Unauthorized
- 404: Vendor not found
- 500: Database error

---

### 2. Update Vendor Profile
**Endpoint:** `PUT /vendor/me`

**Request Body:** (all fields optional)
```json
{
  "businessName": "Updated Business Name",
  "ownerName": "Updated Owner",
  "email": "newemail@example.com",
  "address": "New Address",
  "city": "Lahore",
  "area": "Gulberg",
  "mapLocationUrl": "https://maps.google.com/...",
  "businessImages": ["https://cloudinary.com/new-image.jpg"],
  "mobileNumber": "+923001234567"
}
```

**Response (200 OK):** Updated vendor object (same structure as Get)

**Errors:**
- 401: Unauthorized
- 400: Invalid data
- 500: Database error

---

### 3. Delete Vendor Account
**Endpoint:** `DELETE /vendor/me`

**Response (200 OK):**
```json
{
  "message": "Vendor account deleted successfully"
}
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

### 4. List Public Vendors
**Endpoint:** `GET /vendors`

**Description:** Return public vendor listings for the frontend with optional filtering, search, location filtering, budget filtering, and sorting.

**Query Parameters:**
- `category` – filter vendors by service category, example: `Banquet Hall`
- `search` – search by business name, owner, city, area, service name, or description
- `location` – filter by city, area, or address
- `budget` – maximum price filter (alias for `maxPrice`)
- `minPrice` – minimum service price
- `maxPrice` – maximum service price
- `sortBy` – one of `newest`, `popularity`, `rating`, `price_low_to_high`, `price_high_to_low`

**Example Requests:**
```http
GET /vendors?category=Banquet%20Hall
GET /vendors?search=Wedding
GET /vendors?location=Delhi
GET /vendors?minPrice=1000&maxPrice=5000
GET /vendors?sortBy=rating
GET /vendors?category=Banquet%20Hall&location=Delhi&budget=5000&sortBy=price_low_to_high
```

**Response (200 OK):**
```json
[
  {
    "id": "vendor-123",
    "businessName": "ABC Wedding Hall",
    "ownerName": "Ali Khan",
    "city": "Delhi",
    "area": "Connaught Place",
    "status": "APPROVED",
    "services": [
      {
        "id": "service-1",
        "category": "Banquet Hall",
        "serviceName": "Luxury Hall",
        "price": 5000
      }
    ],
    "reviews": [
      {
        "id": "review-1",
        "userName": "Arjun",
        "rating": 5,
        "comment": "Excellent"
      }
    ],
    "reviewCount": 1,
    "averageRating": 5,
    "minPrice": 5000,
    "maxPrice": 5000,
    "serviceCount": 1,
    "popularity": 2
  }
]
```

---

### 5. Get Vendor Detail
**Endpoint:** `GET /vendors/{vendorId}`

**Description:** Return a specific vendor with profile, services, and reviews together.

**Response (200 OK):**
```json
{
  "vendor": {
    "id": "vendor-123",
    "businessName": "ABC Wedding Hall"
  },
  "services": [],
  "reviews": []
}
```

---

### 6. List Services
**Endpoint:** `GET /vendor/services`

**Query Parameters:**
- None

**Response (200 OK):**
```json
[
  {
    "id": "service-001",
    "vendorId": "vendor-001",
    "category": "Photography",
    "serviceName": "Professional Wedding Photography",
    "description": "Full day wedding coverage",
    "price": 50000,
    "capacity": 100,
    "galleryImages": ["https://cloudinary.com/photo1.jpg"],
    "videoUrls": ["https://cloudinary.com/video1.mp4"],
    "highlights": ["4K Video", "Drone Footage"],
    "createdAt": "2026-06-23T10:30:00Z",
    "updatedAt": "2026-06-23T10:30:00Z"
  }
]
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

### 5. Create Service
**Endpoint:** `POST /vendor/services`

**Request Body:**
```json
{
  "category": "Photography",
  "serviceName": "Professional Wedding Photography",
  "description": "Full day wedding coverage with drone footage",
  "price": 50000,
  "capacity": 100,
  "galleryImages": ["https://cloudinary.com/photo1.jpg"],
  "videoUrls": ["https://cloudinary.com/video1.mp4"],
  "highlights": ["4K Video", "Drone Footage"]
}
```

**Response (201 Created):** Created service object

**Errors:**
- 400: Invalid data (missing required fields)
- 401: Unauthorized
- 500: Database error

---

### 6. Update Service
**Endpoint:** `PATCH /vendor/services/:serviceId`

**URL Parameters:**
- `serviceId`: Service UUID

**Request Body:** (all fields optional)
```json
{
  "category": "Photography",
  "serviceName": "Updated Service Name",
  "description": "Updated description",
  "price": 55000,
  "capacity": 150,
  "galleryImages": ["https://cloudinary.com/photo2.jpg"],
  "videoUrls": ["https://cloudinary.com/video2.mp4"],
  "highlights": ["8K Video", "Drone Footage"]
}
```

**Response (200 OK):** Updated service object

**Errors:**
- 400: Invalid serviceId
- 401: Unauthorized
- 404: Service not found
- 500: Database error

---

### 7. Delete Service
**Endpoint:** `DELETE /vendor/services/:serviceId`

**URL Parameters:**
- `serviceId`: Service UUID

**Response (200 OK):**
```json
{
  "message": "Service deleted successfully"
}
```

**Errors:**
- 401: Unauthorized
- 404: Service not found
- 500: Database error

---

### 8. List Offers
**Endpoint:** `GET /vendor/offers`

**Response (200 OK):**
```json
[
  {
    "id": "offer-001",
    "vendorId": "vendor-001",
    "title": "Summer Special Discount",
    "description": "20% off on all photography packages",
    "discountPercent": 20,
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-08-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-06-23T10:30:00Z",
    "updatedAt": "2026-06-23T10:30:00Z"
  }
]
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

### 9. Create Offer
**Endpoint:** `POST /vendor/offers`

**Request Body:**
```json
{
  "title": "Summer Special Discount",
  "description": "20% off on all photography packages",
  "discountPercent": 20,
  "startDate": "2026-08-01T00:00:00Z",
  "endDate": "2026-08-31T23:59:59Z",
  "isActive": true
}
```

**Response (201 Created):** Created offer object

**Errors:**
- 400: Invalid data
- 401: Unauthorized
- 500: Database error

---

### 10. Update Offer
**Endpoint:** `PATCH /vendor/offers/:offerId`

**URL Parameters:**
- `offerId`: Offer UUID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Offer Title",
  "description": "Updated description",
  "discountPercent": 25,
  "startDate": "2026-09-01T00:00:00Z",
  "endDate": "2026-09-30T23:59:59Z",
  "isActive": true
}
```

**Response (200 OK):** Updated offer object

**Errors:**
- 400: Invalid offerId or data
- 401: Unauthorized
- 404: Offer not found
- 500: Database error

---

### 11. Delete Offer
**Endpoint:** `DELETE /vendor/offers/:offerId`

**URL Parameters:**
- `offerId`: Offer UUID

**Response (200 OK):**
```json
{
  "message": "Offer deleted successfully"
}
```

**Errors:**
- 401: Unauthorized
- 404: Offer not found
- 500: Database error

---

### 12. List Reviews
**Endpoint:** `GET /vendor/reviews`

**Response (200 OK):**
```json
[
  {
    "id": "review-001",
    "vendorId": "vendor-001",
    "userName": "Ahmed Hassan",
    "rating": 5,
    "comment": "Excellent service! Highly recommended.",
    "createdAt": "2026-06-20T15:30:00Z"
  }
]
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

### 13. Create Review
**Endpoint:** `POST /vendor/reviews`

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Amazing service! Very professional team.",
  "userName": "Ahmed Hassan"  // optional, defaults to "Anonymous"
}
```

**Response (201 Created):**
```json
{
  "id": "review-001",
  "vendorId": "vendor-001",
  "userName": "Ahmed Hassan",
  "rating": 5,
  "comment": "Amazing service! Very professional team.",
  "createdAt": "2026-06-23T10:30:00Z"
}
```

**Errors:**
- 400: Invalid rating (must be 1-5) or comment length
- 401: Unauthorized
- 500: Database error

---

### 14. Get Dashboard Stats
**Endpoint:** `GET /vendor/dashboard`

**Response (200 OK):**
```json
{
  "totalServices": 5,
  "totalOffers": 2,
  "activeOffers": 1,
  "totalViews": 1500,
  "totalContactReveals": 200,
  "totalWhatsappClicks": 85,
  "totalLeads": 45
}
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

## � User APIs

All user endpoints require `Authorization: Bearer <user_jwt_token>`

### 1. Get User Profile
**Endpoint:** `GET /user/me`

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "+923001234567",
  "isPhoneVerified": true,
  "fullName": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "city": "Lahore",
  "area": "Gulberg",
  "createdAt": "2026-06-23T10:30:00Z",
  "updatedAt": "2026-06-23T10:30:00Z"
}
```

**Errors:**
- 401: Unauthorized
- 404: User not found
- 500: Database error

---

### 2. Update User Profile
**Endpoint:** `PUT /user/me`

**Request Body:** (all fields optional)
```json
{
  "fullName": "Updated Name",
  "email": "newemail@example.com",
  "city": "Karachi",
  "area": "Defence"
}
```

**Response (200 OK):** Updated user object (same structure as Get)

**Errors:**
- 401: Unauthorized
- 400: Invalid data
- 500: Database error

---

### 3. Delete User Account
**Endpoint:** `DELETE /user/me`

**Response (200 OK):**
```json
{
  "message": "User account deleted successfully"
}
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

## �📊 Analytics APIs

### Track Event
**Endpoint:** `POST /analytics/events`

**Description:** Track user interactions with vendors

**Request Body:**
```json
{
  "vendorId": "vendor-001",
  "type": "VIEW|CONTACT_REVEAL|WHATSAPP_CLICK|LEAD",
  "source": "mobile|web|app",  // optional
  "metadata": {                  // optional
    "deviceType": "android",
    "userId": "user-123"
  }
}
```

**Event Types:**
- `VIEW` - User viewed vendor profile
- `CONTACT_REVEAL` - User revealed contact info
- `WHATSAPP_CLICK` - User clicked WhatsApp button
- `LEAD` - User submitted inquiry

**Response (201 Created):**
```json
{
  "id": "event-001",
  "vendorId": "vendor-001",
  "type": "VIEW",
  "source": "mobile",
  "metadata": { "deviceType": "android" },
  "createdAt": "2026-06-23T10:30:00Z"
}
```

**Errors:**
- 400: Invalid vendorId or event type
- 500: Database error

---

## 📤 Upload APIs

### Get Cloudinary Upload Signature
**Endpoint:** `GET /uploads/signature`

**Authorization:** Bearer token (optional for now)

**Response (200 OK):**
```json
{
  "signature": "abcdef123456",
  "timestamp": 1234567890,
  "publicId": "subhdin/image-123456"
}
```

**Usage:**
Use these values to upload directly to Cloudinary from frontend:
```javascript
const form = new FormData();
form.append('file', file);
form.append('signature', signature);
form.append('timestamp', timestamp);
form.append('public_id', publicId);
form.append('api_key', CLOUDINARY_API_KEY);

fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
  method: 'POST',
  body: form
});
```

**Errors:**
- 500: Signature generation failed

---

## ✅ Health Check

### Health Check
**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "ok": true
}
```

---

## 🛠️ Error Handling

All errors follow this structure:

```json
{
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2026-06-23T10:30:00Z"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📋 Request/Response Examples

### Vendor Registration Flow

**Step 1: Request OTP**
```bash
curl -X POST http://localhost:4000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+923001234567"}'
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+923001234567",
    "code": "123456",
    "role": "vendor",
    "businessName": "ABC Wedding Planner",
    "ownerName": "Ali Khan",
    "email": "ali@example.com"
  }'
```

**Response includes JWT token - save this for authenticated requests**

**Step 3: Get Profile**
```bash
curl -X GET http://localhost:4000/api/vendor/me \
  -H "Authorization: Bearer <jwt_token>"
```

---

### User Registration Flow

**Step 1: Request OTP**
```bash
curl -X POST http://localhost:4000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+923001234567"}'
```

**Step 2: Verify OTP**
```bash
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+923001234567",
    "code": "123456",
    "role": "user",
    "fullName": "Ahmed Hassan",
    "email": "ahmed@example.com"
  }'
```

---

## 🔑 Phone Number Format

Phone numbers must follow international format:
- With +: `+923001234567` ✅
- With 00: Not accepted ❌
- Without country code: Not accepted ❌

---

## ⏱️ Timeouts & Limits

- **OTP Expiry:** 5 minutes
- **JWT Expiry:** 7 days
- **Request Size Limit:** 2MB
- **Rate Limiting:** Not implemented yet (add as needed)

---

## 🚀 Frontend Integration Tips

### 1. Store JWT Token
```javascript
// After successful OTP verification
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### 2. Add Token to All Authenticated Requests
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

### 3. Handle Token Expiry
```javascript
if (error.response.status === 401) {
  // Token expired, redirect to login
  localStorage.removeItem('token');
  // navigate to login
}
```

### 4. Upload Files to Cloudinary
```javascript
async function uploadImage(file) {
  const signatureRes = await fetch('/api/uploads/signature', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { signature, timestamp, publicId } = await signatureRes.json();
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);
  formData.append('public_id', publicId);
  formData.append('api_key', CLOUDINARY_API_KEY);
  
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  
  return uploadRes.json();
}
```

---

## 📞 Support

For issues or questions, refer to swagger documentation at:
- Local: `http://localhost:4000/api/swagger`
- Production: `https://subhdin-be.onrender.com/api/swagger`
