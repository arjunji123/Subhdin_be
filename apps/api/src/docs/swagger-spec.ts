export const swaggerSpec = {
  openapi: "3.0.3",
  info: { title: "ShaadiHub API", version: "1.0.0", description: "Vendor management backend – phone OTP auth, vendor CRUD, analytics, uploads." },
  servers: [
    { url: "http://localhost:4000/api", description: "Local" },
    { url: "https://shaadihub.onrender.com/api", description: "Production (Render)" },
  ],
  tags: [
    { name: "Auth", description: "Phone OTP authentication" },
    { name: "Vendor", description: "Vendor profile, services, offers, reviews, dashboard" },
    { name: "Analytics", description: "User event tracking" },
    { name: "Uploads", description: "Cloudinary signed uploads" },
  ],
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
  paths: {
    "/health": { get: { tags: ["Auth"], summary: "Health check", responses: { 200: { description: "OK" } } } },
    "/auth/request-otp": { post: { tags: ["Auth"], summary: "Request OTP", responses: { 200: { description: "OTP sent" } } } },
    "/auth/verify-otp": { post: { tags: ["Auth"], summary: "Verify OTP & get JWT", responses: { 200: { description: "Token returned" } } } },
    "/vendor/me": {
      get: { tags: ["Vendor"], summary: "Get vendor profile", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
      put: { tags: ["Vendor"], summary: "Update vendor profile", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
      delete: { tags: ["Vendor"], summary: "Delete vendor", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
    },
    "/vendor/services": {
      get: { tags: ["Vendor"], summary: "List services", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
      post: { tags: ["Vendor"], summary: "Create service", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" } } },
    },
    "/vendor/services/{serviceId}": {
      patch: { tags: ["Vendor"], summary: "Update service", security: [{ bearerAuth: [] }], parameters: [{ name: "serviceId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
      delete: { tags: ["Vendor"], summary: "Delete service", security: [{ bearerAuth: [] }], parameters: [{ name: "serviceId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
    },
    "/vendor/offers": {
      get: { tags: ["Vendor"], summary: "List offers", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
      post: { tags: ["Vendor"], summary: "Create offer", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" } } },
    },
    "/vendor/offers/{offerId}": {
      patch: { tags: ["Vendor"], summary: "Update offer", security: [{ bearerAuth: [] }], parameters: [{ name: "offerId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
      delete: { tags: ["Vendor"], summary: "Delete offer", security: [{ bearerAuth: [] }], parameters: [{ name: "offerId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
    },
    "/vendor/reviews": {
      get: { tags: ["Vendor"], summary: "List reviews", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
      post: { tags: ["Vendor"], summary: "Create review", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" } } },
    },
    "/vendor/dashboard": { get: { tags: ["Vendor"], summary: "Dashboard stats", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } } },
    "/analytics/events": { post: { tags: ["Analytics"], summary: "Track event", responses: { 201: { description: "Recorded" } } } },
    "/uploads/signature": { get: { tags: ["Uploads"], summary: "Get Cloudinary upload signature", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } } },
  },
};
