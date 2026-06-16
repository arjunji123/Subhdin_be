// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const swaggerSpec: any = {
  openapi: "3.0.3",
  info: {
    title: "ShaadiHub API",
    version: "1.0.0",
    description: "Vendor management backend – phone OTP auth, vendor CRUD, analytics, file uploads.",
    contact: { name: "ShaadiHub Team" },
  },
  servers: [
    { url: "http://localhost:4000/api", description: "Local development" },
    { url: "https://shaadihub.onrender.com/api", description: "Production (Render)" },
  ],
  tags: [
    { name: "Auth", description: "Phone OTP authentication" },
    { name: "Vendor", description: "Vendor profile, services, offers, reviews, dashboard" },
    { name: "Analytics", description: "User event tracking" },
    { name: "Uploads", description: "Cloudinary signed uploads" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "JWT from /auth/verify-otp" },
    },
    schemas: {
      HealthResponse: { type: "object", properties: { ok: { type: "boolean", example: true } } },
      RequestOtpRequest: { type: "object", required: ["phone"], properties: { phone: { type: "string", example: "919876543210" } } },
      RequestOtpResponse: { type: "object", properties: { message: { type: "string" }, debugCode: { type: "string" } } },
      VerifyOtpRequest: { type: "object", required: ["phone", "code"], properties: { phone: { type: "string" }, code: { type: "string", example: "123456" } } },
      VerifyOtpResponse: { type: "object", properties: { message: { type: "string" }, token: { type: "string" } } },
      ErrorResponse: { type: "object", properties: { message: { type: "string" } } },
      ValidationError: { type: "object", properties: { message: { type: "string" }, issues: { type: "object" } } },
      VendorProfile: { type: "object", properties: { id: { type: "string" }, phone: { type: "string" }, isPhoneVerified: { type: "boolean" }, businessName: { type: "string" }, ownerName: { type: "string" }, mobileNumber: { type: "string" }, email: { type: "string" }, address: { type: "string" }, city: { type: "string" }, area: { type: "string" }, mapLocationUrl: { type: "string" }, businessImages: { type: "array", items: { type: "string" } }, status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] }, services: { type: "array", items: { $ref: "#/components/schemas/Service" } }, offers: { type: "array", items: { $ref: "#/components/schemas/Offer" } }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      VendorProfileUpdate: { type: "object", properties: { businessName: { type: "string" }, ownerName: { type: "string" }, mobileNumber: { type: "string" }, email: { type: "string" }, address: { type: "string" }, city: { type: "string" }, area: { type: "string" }, mapLocationUrl: { type: "string" }, businessImages: { type: "array", items: { type: "string" } } } },
      DeleteResponse: { type: "object", properties: { message: { type: "string" } } },
      Service: { type: "object", properties: { id: { type: "string" }, vendorId: { type: "string" }, category: { type: "string" }, serviceName: { type: "string" }, description: { type: "string" }, price: { type: "number" }, capacity: { type: "integer" }, galleryImages: { type: "array", items: { type: "string" } }, videoUrls: { type: "array", items: { type: "string" } }, highlights: { type: "array", items: { type: "string" } }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      ServiceCreate: { type: "object", required: ["category", "serviceName", "description", "price"], properties: { category: { type: "string", example: "Catering" }, serviceName: { type: "string", example: "Premium Wedding Catering" }, description: { type: "string", example: "Full-service catering" }, price: { type: "number", example: 50000 }, capacity: { type: "integer", example: 500 }, galleryImages: { type: "array", items: { type: "string" } }, videoUrls: { type: "array", items: { type: "string" } }, highlights: { type: "array", items: { type: "string" } } } },
      ServiceUpdate: { type: "object", properties: { category: { type: "string" }, serviceName: { type: "string" }, description: { type: "string" }, price: { type: "number" }, capacity: { type: "integer" }, galleryImages: { type: "array", items: { type: "string" } }, videoUrls: { type: "array", items: { type: "string" } }, highlights: { type: "array", items: { type: "string" } } } },
      Offer: { type: "object", properties: { id: { type: "string" }, vendorId: { type: "string" }, title: { type: "string" }, description: { type: "string" }, discountPercent: { type: "integer" }, startDate: { type: "string", format: "date-time" }, endDate: { type: "string", format: "date-time" }, isActive: { type: "boolean" }, createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" } } },
      OfferCreate: { type: "object", required: ["title", "description", "discountPercent", "startDate", "endDate"], properties: { title: { type: "string", example: "Diwali Special" }, description: { type: "string", example: "20% off" }, discountPercent: { type: "integer", example: 20 }, startDate: { type: "string", format: "date-time" }, endDate: { type: "string", format: "date-time" }, isActive: { type: "boolean" } } },
      OfferUpdate: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, discountPercent: { type: "integer" }, startDate: { type: "string", format: "date-time" }, endDate: { type: "string", format: "date-time" }, isActive: { type: "boolean" } } },
      Review: { type: "object", properties: { id: { type: "string" }, vendorId: { type: "string" }, userName: { type: "string" }, rating: { type: "integer", minimum: 1, maximum: 5 }, comment: { type: "string" }, createdAt: { type: "string", format: "date-time" } } },
      ReviewCreate: { type: "object", required: ["rating", "comment"], properties: { rating: { type: "integer", example: 5 }, comment: { type: "string", example: "Amazing!" }, userName: { type: "string", example: "Rahul" } } },
      AnalyticsEventRequest: { type: "object", required: ["vendorId", "type"], properties: { vendorId: { type: "string" }, type: { type: "string", enum: ["VIEW", "CONTACT_REVEAL", "WHATSAPP_CLICK", "LEAD"] }, source: { type: "string" }, metadata: { type: "object" } } },
      AnalyticsEvent: { type: "object", properties: { id: { type: "string" }, vendorId: { type: "string" }, type: { type: "string", enum: ["VIEW", "CONTACT_REVEAL", "WHATSAPP_CLICK", "LEAD"] }, source: { type: "string" }, metadata: { type: "object" }, createdAt: { type: "string", format: "date-time" } } },
      UploadSignatureResponse: { type: "object", properties: { cloudName: { type: "string" }, apiKey: { type: "string" }, timestamp: { type: "integer" }, folder: { type: "string" }, signature: { type: "string" } } },
      DashboardResponse: { type: "object", properties: { totalServices: { type: "integer" }, totalOffers: { type: "integer" }, activeOffers: { type: "integer" }, totalViews: { type: "integer" }, totalContactReveals: { type: "integer" }, totalWhatsappClicks: { type: "integer" }, totalLeads: { type: "integer" } } },
    },
  },
  paths: {
    "/health": { get: { tags: ["Auth"], summary: "Health check", operationId: "healthCheck", responses: { 200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } } } } } },
    "/auth/request-otp": { post: { tags: ["Auth"], summary: "Request OTP", description: "Sends 6-digit OTP via Twilio SMS", operationId: "requestOtp", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RequestOtpRequest" } } } }, responses: { 200: { description: "OTP sent", content: { "application/json": { schema: { $ref: "#/components/schemas/RequestOtpResponse" } } } }, 422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } } } } },
    "/auth/verify-otp": { post: { tags: ["Auth"], summary: "Verify OTP & get JWT", operationId: "verifyOtp", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyOtpRequest" } } } }, responses: { 200: { description: "Verified", content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyOtpResponse" } } } }, 400: { description: "OTP expired" }, 401: { description: "Invalid OTP" }, 404: { description: "Not found" }, 422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } } } } },
    "/vendor/me": {
      get: { tags: ["Vendor"], summary: "Get vendor profile", operationId: "getVendorMe", security: [{ bearerAuth: [] }], responses: { 200: { description: "Profile", content: { "application/json": { schema: { $ref: "#/components/schemas/VendorProfile" } } } }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } } },
      put: { tags: ["Vendor"], summary: "Update vendor profile", operationId: "updateVendorMe", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/VendorProfileUpdate" } } } }, responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" }, 422: { description: "Validation error" } } },
      delete: { tags: ["Vendor"], summary: "Delete vendor", operationId: "deleteVendorMe", security: [{ bearerAuth: [] }], responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" } } },
    },
    "/vendor/services": {
      get: { tags: ["Vendor"], summary: "List services", operationId: "listServices", security: [{ bearerAuth: [] }], responses: { 200: { description: "Services list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Service" } } } } } } },
      post: { tags: ["Vendor"], summary: "Create service", operationId: "createService", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceCreate" } } } }, responses: { 201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Service" } } } }, 401: { description: "Unauthorized" }, 422: { description: "Validation error" } } },
    },
    "/vendor/services/{serviceId}": {
      patch: { tags: ["Vendor"], summary: "Update service", operationId: "updateService", security: [{ bearerAuth: [] }], parameters: [{ name: "serviceId", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceUpdate" } } } }, responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } } },
      delete: { tags: ["Vendor"], summary: "Delete service", operationId: "deleteService", security: [{ bearerAuth: [] }], parameters: [{ name: "serviceId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } } },
    },
    "/vendor/offers": {
      get: { tags: ["Vendor"], summary: "List offers", operationId: "listOffers", security: [{ bearerAuth: [] }], responses: { 200: { description: "Offers list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Offer" } } } } } } },
      post: { tags: ["Vendor"], summary: "Create offer", operationId: "createOffer", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/OfferCreate" } } } }, responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" }, 422: { description: "Validation error" } } },
    },
    "/vendor/offers/{offerId}": {
      patch: { tags: ["Vendor"], summary: "Update offer", operationId: "updateOffer", security: [{ bearerAuth: [] }], parameters: [{ name: "offerId", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/OfferUpdate" } } } }, responses: { 200: { description: "Updated" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } } },
      delete: { tags: ["Vendor"], summary: "Delete offer", operationId: "deleteOffer", security: [{ bearerAuth: [] }], parameters: [{ name: "offerId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" }, 401: { description: "Unauthorized" }, 404: { description: "Not found" } } },
    },
    "/vendor/reviews": {
      get: { tags: ["Vendor"], summary: "List reviews", operationId: "listReviews", security: [{ bearerAuth: [] }], responses: { 200: { description: "Reviews", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } } } },
      post: { tags: ["Vendor"], summary: "Create review", operationId: "createReview", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewCreate" } } } }, responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" }, 422: { description: "Validation error" } } },
    },
    "/vendor/dashboard": {
      get: { tags: ["Vendor"], summary: "Dashboard stats", operationId: "getDashboard", security: [{ bearerAuth: [] }], responses: { 200: { description: "Stats", content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardResponse" } } } }, 401: { description: "Unauthorized" } } },
    },
    "/analytics/events": {
      post: { tags: ["Analytics"], summary: "Track event", operationId: "trackEvent", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AnalyticsEventRequest" } } } }, responses: { 201: { description: "Recorded" }, 422: { description: "Validation error" } } },
    },
    "/uploads/signature": {
      get: { tags: ["Uploads"], summary: "Get Cloudinary upload signature", operationId: "getUploadSignature", security: [{ bearerAuth: [] }], responses: { 200: { description: "Signature", content: { "application/json": { schema: { $ref: "#/components/schemas/UploadSignatureResponse" } } } }, 401: { description: "Unauthorized" }, 500: { description: "Not configured" } } },
    },
  },
};