import { z } from "zod";

export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/);

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
});

export const vendorProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  mobileNumber: phoneSchema.optional(),
  email: z.string().email().optional(),
  address: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  area: z.string().min(2).optional(),
  mapLocationUrl: z.string().url().optional(),
  businessImages: z.array(z.string().url()).optional(),
});

export const serviceCreateSchema = z.object({
  category: z.string().min(2),
  serviceName: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  capacity: z.number().int().positive().optional(),
  galleryImages: z.array(z.string().url()).optional().default([]),
  videoUrls: z.array(z.string().url()).optional().default([]),
  highlights: z.array(z.string().min(1)).optional().default([]),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const offerCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  discountPercent: z.number().int().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const offerUpdateSchema = offerCreateSchema.partial();

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export const analyticsEventSchema = z.object({
  vendorId: z.string().min(10),
  type: z.enum(["VIEW", "CONTACT_REVEAL", "WHATSAPP_CLICK", "LEAD"]),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type VendorProfileInput = z.infer<typeof vendorProfileSchema>;
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type OfferCreateInput = z.infer<typeof offerCreateSchema>;
export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
