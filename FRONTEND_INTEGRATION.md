# Frontend Integration Guide

## 🚀 Quick Start

### Authentication Flow

```javascript
// 1. REQUEST OTP
const requestOTP = async (phone) => {
  const res = await fetch('http://localhost:4000/api/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  return res.json();
};

// 2. VERIFY OTP
const verifyOTP = async (phone, code, role, profileData) => {
  const res = await fetch('http://localhost:4000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      code,
      role, // "vendor" or "user"
      ...profileData
    })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

// 3. API CALL HELPER
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`http://localhost:4000/api${endpoint}`, options);
  
  // Auto redirect to login if unauthorized
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return res.json();
};
```

---

## 🧑‍💼 Vendor Integration

### Vendor Registration
```javascript
const vendorSignup = async (phone, code, vendorData) => {
  return verifyOTP(phone, code, 'vendor', {
    businessName: vendorData.businessName,
    ownerName: vendorData.ownerName,
    email: vendorData.email,
    mobileNumber: vendorData.mobileNumber,
    address: vendorData.address,
    city: vendorData.city,
    area: vendorData.area,
    mapLocationUrl: vendorData.mapLocationUrl,
    businessImages: vendorData.businessImages // array of image URLs
  });
};
```

### Get Vendor Profile
```javascript
const getProfile = () => {
  return apiCall('/vendor/me');
};
```

### Update Vendor Profile
```javascript
const updateProfile = (updates) => {
  return apiCall('/vendor/me', 'PUT', updates);
};
```

### Services Management

```javascript
// List all services
const getServices = () => {
  return apiCall('/vendor/services');
};

// Create service
const createService = (serviceData) => {
  return apiCall('/vendor/services', 'POST', {
    category: 'Photography', // required
    serviceName: 'Professional Photography', // required
    description: 'Full day coverage', // required
    price: 50000, // required (number)
    capacity: 100, // optional
    galleryImages: ['url1', 'url2'], // optional
    videoUrls: ['video1'], // optional
    highlights: ['4K', 'Drone'] // optional
  });
};

// Update service
const updateService = (serviceId, updates) => {
  return apiCall(`/vendor/services/${serviceId}`, 'PATCH', updates);
};

// Delete service
const deleteService = (serviceId) => {
  return apiCall(`/vendor/services/${serviceId}`, 'DELETE');
};
```

### Offers Management

```javascript
// List offers
const getOffers = () => {
  return apiCall('/vendor/offers');
};

// Create offer
const createOffer = (offerData) => {
  return apiCall('/vendor/offers', 'POST', {
    title: 'Summer Discount', // required
    description: '20% off', // required
    discountPercent: 20, // required (1-100)
    startDate: '2026-08-01T00:00:00Z', // required
    endDate: '2026-08-31T23:59:59Z', // required
    isActive: true // optional
  });
};

// Update offer
const updateOffer = (offerId, updates) => {
  return apiCall(`/vendor/offers/${offerId}`, 'PATCH', updates);
};

// Delete offer
const deleteOffer = (offerId) => {
  return apiCall(`/vendor/offers/${offerId}`, 'DELETE');
};
```

### Reviews

```javascript
// List reviews
const getReviews = () => {
  return apiCall('/vendor/reviews');
};

// Create review (customer creates this)
const createReview = (vendorId, reviewData) => {
  return apiCall('/analytics/events', 'POST', {
    vendorId,
    type: 'LEAD'
  });
};
```

### Dashboard

```javascript
const getDashboard = () => {
  return apiCall('/vendor/dashboard');
  // Returns: {
  //   totalServices,
  //   totalOffers,
  //   activeOffers,
  //   totalViews,
  //   totalContactReveals,
  //   totalWhatsappClicks,
  //   totalLeads
  // }
};
```

---

## 👤 User/Customer Integration

### User Registration
```javascript
const userSignup = async (phone, code, userData) => {
  return verifyOTP(phone, code, 'user', {
    fullName: userData.fullName,
    email: userData.email,
    city: userData.city,
    area: userData.area
  });
};
```

### User Login
```javascript
const userLogin = async (phone, code) => {
  return verifyOTP(phone, code, 'user');
};
```

### Get User Profile
```javascript
const getUserProfile = () => {
  return apiCall('/user/me');
};
```

### Update User Profile
```javascript
const updateUserProfile = (updates) => {
  return apiCall('/user/me', 'PUT', updates);
};

// Example usage
const updateProfile = async () => {
  try {
    const result = await updateUserProfile({
      fullName: 'Updated Name',
      email: 'newemail@example.com',
      city: 'Karachi',
      area: 'Defence'
    });
    console.log('Profile updated:', result);
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### Delete User Account
```javascript
const deleteUserAccount = () => {
  return apiCall('/user/me', 'DELETE');
};

// Example usage
const handleDeleteAccount = async () => {
  if (window.confirm('Are you sure you want to delete your account?')) {
    try {
      await deleteUserAccount();
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      alert('Error deleting account:', error.message);
    }
  }
};
```

---

## 📸 Image Upload (Cloudinary Integration)

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_NAME,
  apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY
};

const uploadImage = async (file) => {
  try {
    // Get signature from backend
    const sigRes = await apiCall('/uploads/signature');
    const { signature, timestamp, publicId } = sigRes;
    
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    const result = await uploadRes.json();
    return result.secure_url; // Use this URL in your app
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

---

## 📊 Analytics Tracking

```javascript
const trackEvent = (vendorId, eventType, metadata = {}) => {
  return apiCall('/analytics/events', 'POST', {
    vendorId,
    type: eventType, // VIEW, CONTACT_REVEAL, WHATSAPP_CLICK, LEAD
    source: 'mobile', // optional
    metadata // optional
  });
};

// Usage examples
trackEvent(vendorId, 'VIEW'); // User viewed vendor
trackEvent(vendorId, 'CONTACT_REVEAL'); // User revealed contact
trackEvent(vendorId, 'WHATSAPP_CLICK'); // User clicked WhatsApp
trackEvent(vendorId, 'LEAD'); // User submitted inquiry
```

---

## 🎯 Error Handling

```javascript
const handleError = (error) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.clear();
    window.location.href = '/login';
  } else if (error.response?.status === 404) {
    // Not found
    console.error('Resource not found:', error.response.data.message);
  } else if (error.response?.status === 400) {
    // Validation error
    console.error('Validation error:', error.response.data.message);
  } else {
    // Other errors
    console.error('Error:', error.response?.data?.message || error.message);
  }
};

// Use in try-catch
try {
  const result = await getProfile();
  console.log(result);
} catch (error) {
  handleError(error);
}
```

---

## 🔗 Environment Variables

Create `.env` file in your frontend project:

```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_CLOUDINARY_NAME=your-cloudinary-name
REACT_APP_CLOUDINARY_API_KEY=your-api-key
```

Use in code:
```javascript
const API_URL = process.env.REACT_APP_API_URL;
```

---

## 📱 Form Examples

### Vendor Registration Form
```javascript
const [formData, setFormData] = useState({
  phone: '',
  code: '',
  businessName: '',
  ownerName: '',
  email: '',
  mobileNumber: '',
  address: '',
  city: '',
  area: '',
  mapLocationUrl: '',
  businessImages: []
});

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const result = await vendorSignup(
      formData.phone,
      formData.code,
      {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        // ... other fields
      }
    );
    
    if (result.token) {
      alert('Registration successful!');
      // Redirect to dashboard
    }
  } catch (error) {
    alert(error.message);
  }
};
```

### Service Creation Form
```javascript
const [serviceForm, setServiceForm] = useState({
  category: '',
  serviceName: '',
  description: '',
  price: 0,
  capacity: 1,
  galleryImages: [],
  videoUrls: [],
  highlights: []
});

const handleCreateService = async () => {
  try {
    const result = await createService(serviceForm);
    alert('Service created successfully!');
    // Clear form or redirect
  } catch (error) {
    alert('Error: ' + error.message);
  }
};
```

---

## 🧪 Testing Endpoints

### Using cURL

**Request OTP:**
```bash
curl -X POST http://localhost:4000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+923001234567"
  }'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+923001234567",
    "code": "123456",
    "role": "vendor",
    "businessName": "My Business"
  }'
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:4000/api/vendor/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Import collection from `API_DOCUMENTATION.md`
2. Set `{{baseUrl}}` to `http://localhost:4000/api`
3. After login, set `{{token}}` from response
4. Use `{{token}}` in Authorization header for protected routes

---

## ✅ Checklist

- [ ] Environment variables configured
- [ ] API base URL set correctly
- [ ] JWT token stored in localStorage
- [ ] Error handling implemented
- [ ] Logout clears token and user data
- [ ] Unauthorized redirects to login
- [ ] Image upload working
- [ ] Analytics events tracking
- [ ] Responsive design for mobile
- [ ] Loading states for API calls

---

## 🐛 Common Issues

### Issue: 401 Unauthorized on protected routes
**Solution:** Ensure token is included in Authorization header and not expired

### Issue: CORS errors
**Solution:** Backend CORS already configured, check if API URL matches

### Issue: OTP not received
**Solution:** Check phone number format (+923001234567) in development mode, check console for debug code

### Issue: Image upload fails
**Solution:** Ensure Cloudinary API key is set, check file size < 100MB

---

## 📞 Quick Reference

| Feature | Endpoint | Method |
|---------|----------|--------|
| Request OTP | `/auth/request-otp` | POST |
| Verify OTP | `/auth/verify-otp` | POST |
| **Vendor Endpoints** | | |
| Get Vendor Profile | `/vendor/me` | GET |
| Update Vendor Profile | `/vendor/me` | PUT |
| Delete Vendor Account | `/vendor/me` | DELETE |
| List Services | `/vendor/services` | GET |
| Create Service | `/vendor/services` | POST |
| Update Service | `/vendor/services/{id}` | PATCH |
| Delete Service | `/vendor/services/{id}` | DELETE |
| List Offers | `/vendor/offers` | GET |
| Create Offer | `/vendor/offers` | POST |
| Update Offer | `/vendor/offers/{id}` | PATCH |
| Delete Offer | `/vendor/offers/{id}` | DELETE |
| List Reviews | `/vendor/reviews` | GET |
| Get Dashboard | `/vendor/dashboard` | GET |
| **User Endpoints** | | |
| Get User Profile | `/user/me` | GET |
| Update User Profile | `/user/me` | PUT |
| Delete User Account | `/user/me` | DELETE |
| **Other** | | |
| Track Event | `/analytics/events` | POST |
| Get Upload Sig | `/uploads/signature` | GET |
