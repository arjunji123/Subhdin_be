export const swaggerSpec = {
  openapi: "3.0.3",
  info: { title: "Subhdin API", version: "1.0.0", description: "Vendor management backend – phone OTP auth, vendor CRUD, analytics, uploads." },
  servers: [
    { url: "http://localhost:4000/api", description: "Local" },
    { url: "https://subhdin-be.onrender.com/api", description: "Production (Render)" },
  ],
  tags: [
    { name: "Auth", description: "Phone OTP authentication" },
    { name: "Vendor", description: "Vendor profile, services, offers, reviews, dashboard" },
    { name: "User", description: "User/Customer profile management" },
    { name: "Analytics", description: "User event tracking" },
    { name: "Uploads", description: "Cloudinary signed uploads" },
  ],
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
  paths: {
    "/health": { get: { tags: ["Auth"], summary: "Health check", responses: { 200: { description: "OK" } } } },
    "/auth/request-otp": { post: { tags: ["Auth"], summary: "Request OTP", description: "Send OTP for vendor or user registration/login. Works for new or existing phone numbers.", responses: { 200: { description: "OTP sent" } } } },
    "/auth/verify-otp": { post: { tags: ["Auth"], summary: "Verify OTP & get JWT", description: "Verify OTP and get JWT token. Supports both vendor and user roles.", responses: { 200: { description: "Token returned" } } } },
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
    "/vendors/offers": {
    get: {
      tags: ["Vendor"],
      summary: "List all active offers with vendor details (public)",
      responses: {
        200: {
          description: "Array of active offers with nested vendor data",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    vendorId: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    discountPercent: { type: "number" },
                    startDate: { type: "string" },
                    endDate: { type: "string" },
                    isActive: { type: "boolean" },
                    vendor: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        businessName: { type: "string" },
                        ownerName: { type: "string" },
                        city: { type: "string" },
                        area: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
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
    "/vendors": {
      get: { tags: ["Vendor"], summary: "List public vendors", description: "Return all approved vendors with full profile details.", responses: { 200: { description: "OK" } } },
    },
    "/vendors/{vendorId}": {
      get: { tags: ["Vendor"], summary: "Get vendor detail", description: "Return vendor profile, services, and reviews together.", parameters: [{ name: "vendorId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
    },
    "/vendors/{vendorId}/services": {
      get: { tags: ["Vendor"], summary: "List vendor services", description: "Return all services created by a public vendor.", parameters: [{ name: "vendorId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
    },
    "/user/me": {
      get: { tags: ["User"], summary: "Get user profile", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
      put: { tags: ["User"], summary: "Update user profile", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
      delete: { tags: ["User"], summary: "Delete user account", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
    },
    "/analytics/events": { post: { tags: ["Analytics"], summary: "Track event", responses: { 201: { description: "Recorded" } } } },
    "/uploads/signature": { get: { tags: ["Uploads"], summary: "Get Cloudinary upload signature", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } } },
  },
};
