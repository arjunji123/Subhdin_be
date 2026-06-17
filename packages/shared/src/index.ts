import { z } from "zod";

export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/);

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const vendorProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  mobileNumber: phoneSchema.optional(),
  email: z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, z.string().email().optional()),
  address: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  area: z.string().min(2).optional(),
  mapLocationUrl: z.string().url().optional(),
  businessImages: z.array(z.string().url()).optional(),
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
}).merge(vendorProfileSchema);

const nonEmptyStringSchema = z.string().trim().min(1);
const positiveNumberSchema = z.preprocess((value) => {
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().positive());
const optionalPositiveIntSchema = z.preprocess((value) => {
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int().positive().optional());

const urlArraySchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() !== "") return [value];
  return value;
}, z.array(z.string().url()));

const stringArraySchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() !== "") return [value];
  return value;
}, z.array(nonEmptyStringSchema));

export const serviceCreateSchema = z.object({
  category: nonEmptyStringSchema,
  serviceName: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
  price: positiveNumberSchema,
  capacity: optionalPositiveIntSchema,
  galleryImages: urlArraySchema.optional().default([]),
  videoUrls: urlArraySchema.optional().default([]),
  highlights: stringArraySchema.optional().default([]),
});

export const serviceUpdateSchema = z.object({
  category: nonEmptyStringSchema.optional(),
  serviceName: nonEmptyStringSchema.optional(),
  description: nonEmptyStringSchema.optional(),
  price: positiveNumberSchema.optional(),
  capacity: optionalPositiveIntSchema,
  galleryImages: urlArraySchema.optional(),
  videoUrls: urlArraySchema.optional(),
  highlights: stringArraySchema.optional(),
});

export const offerCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
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
