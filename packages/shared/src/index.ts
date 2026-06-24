import { z } from "zod";

export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/);

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

const emailSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}, z.string().email().optional());

const optionalStringSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}, z.string().min(2).optional());

const optionalPhoneSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}, phoneSchema.optional());

const optionalUrlSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}, z.string().url().optional());

export const vendorProfileSchema = z.object({
  businessName: optionalStringSchema,
  ownerName: optionalStringSchema,
  mobileNumber: optionalPhoneSchema,
  email: emailSchema,
  address: optionalStringSchema,
  city: optionalStringSchema,
  area: optionalStringSchema,
  mapLocationUrl: optionalUrlSchema,
  businessImages: z.array(z.string().url()).optional(),
});

export const userProfileSchema = z.object({
  fullName: optionalStringSchema,
  email: emailSchema,
  city: optionalStringSchema,
  area: optionalStringSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
  role: z.enum(["user", "vendor"]).optional(),
}).merge(vendorProfileSchema).merge(userProfileSchema);

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
  vendorId: z.string().min(1).optional(),
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
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type OfferCreateInput = z.infer<typeof offerCreateSchema>;
export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
