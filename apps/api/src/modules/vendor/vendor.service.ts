import type {
  OfferCreateInput,
  OfferUpdateInput,
  ServiceCreateInput,
  ServiceUpdateInput,
  VendorProfileInput,
} from "@shaadihub/shared";

import { supabase } from "../../lib/supabase.js";
import { AppError } from "../../utils/app-error.js";
import { assertSupabase } from "../../utils/supabase-helper.js";

export const getVendorMe = async (vendorId: string) => {
  const { data: vendor, error } = await supabase
    .from("Vendor")
    .select("*, services:Service(*), offers:Offer(*)")
    .eq("id", vendorId)
    .single();

  assertSupabase(vendor, error, "Failed to fetch vendor profile", 500);
  if (!vendor) throw new AppError("Vendor not found", 404);
  return vendor;
};

export const updateVendorMe = async (vendorId: string, payload: VendorProfileInput) => {
  const { data, error } = await supabase
    .from("Vendor")
    .update(payload)
    .eq("id", vendorId)
    .select()
    .single();

  assertSupabase(data, error, "Failed to update vendor", 500);
  return data;
};

export const deleteVendorMe = async (vendorId: string) => {
  // Cascade delete all related records manually
  const deleteOps = [
    supabase.from("AnalyticsEvent").delete().eq("vendorId", vendorId),
    supabase.from("OtpSession").delete().eq("vendorId", vendorId),
    supabase.from("Review").delete().eq("vendorId", vendorId),
    supabase.from("Service").delete().eq("vendorId", vendorId),
    supabase.from("Offer").delete().eq("vendorId", vendorId),
  ];

  const results = await Promise.all(deleteOps);
  results.forEach((result, index) => {
    if (result.error) {
      throw new AppError(`Failed to delete related records (index ${index}): ${result.error.message}`, 500, {
        code: result.error.code,
        details: result.error.details,
      });
    }
  });

  const { error } = await supabase.from("Vendor").delete().eq("id", vendorId);
  if (error) throw new AppError("Failed to delete vendor", 500, { code: error.code, details: error.details });
  return { message: "Account and all related data deleted successfully" };
};

export const listServices = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("Service")
    .select("*")
    .eq("vendorId", vendorId)
    .order("createdAt", { ascending: false });

  assertSupabase(data, error, "Failed to fetch services");
  return data;
};

export const createService = async (vendorId: string, payload: ServiceCreateInput) => {
  const { data, error } = await supabase
    .from("Service")
    .insert({
      vendorId,
      category: payload.category,
      serviceName: payload.serviceName,
      description: payload.description,
      price: payload.price,
      capacity: payload.capacity,
      galleryImages: payload.galleryImages ?? [],
      videoUrls: payload.videoUrls ?? [],
      highlights: payload.highlights ?? [],
    })
    .select()
    .single();

  assertSupabase(data, error, "Failed to create service");
  return data;
};

export const updateService = async (
  vendorId: string,
  serviceId: string,
  payload: ServiceUpdateInput,
) => {
  const { data, error } = await supabase
    .from("Service")
    .update(payload)
    .eq("id", serviceId)
    .eq("vendorId", vendorId)
    .select()
    .single();

  assertSupabase(data, error, "Service not found or update failed", 404);
  return data;
};

export const deleteService = async (vendorId: string, serviceId: string) => {
  const { error } = await supabase
    .from("Service")
    .delete()
    .eq("id", serviceId)
    .eq("vendorId", vendorId);

  if (error) throw new AppError("Service not found or delete failed", 404);
  return { message: "Service deleted successfully" };
};

export const listOffers = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("Offer")
    .select("*")
    .eq("vendorId", vendorId)
    .order("createdAt", { ascending: false });

  assertSupabase(data, error, "Failed to fetch offers");
  return data;
};

export const createOffer = async (vendorId: string, payload: OfferCreateInput) => {
  const { data, error } = await supabase
    .from("Offer")
    .insert({
      vendorId,
      title: payload.title,
      description: payload.description,
      discountPercent: payload.discountPercent,
      startDate: new Date(payload.startDate).toISOString(),
      endDate: new Date(payload.endDate).toISOString(),
      isActive: payload.isActive ?? true,
    })
    .select()
    .single();

  assertSupabase(data, error, "Failed to create offer");
  return data;
};

export const updateOffer = async (vendorId: string, offerId: string, payload: OfferUpdateInput) => {
  const updateData: any = { ...payload };
  if (payload.startDate) updateData.startDate = new Date(payload.startDate).toISOString();
  if (payload.endDate) updateData.endDate = new Date(payload.endDate).toISOString();

  const { data, error } = await supabase
    .from("Offer")
    .update(updateData)
    .eq("id", offerId)
    .eq("vendorId", vendorId)
    .select()
    .single();

  assertSupabase(data, error, "Offer not found or update failed", 404);
  return data;
};

export const deleteOffer = async (vendorId: string, offerId: string) => {
  const { data, error } = await supabase
    .from("Offer")
    .delete()
    .eq("id", offerId)
    .eq("vendorId", vendorId);

  assertSupabase(data, error, "Failed to delete offer");
  if (!data?.length) throw new AppError("Offer not found", 404);
  return { message: "Offer deleted successfully" };
};

export const getDashboard = async (vendorId: string) => {
  const [
    serviceResult,
    offerResult,
    activeOfferResult,
    viewResult,
    contactRevealResult,
    whatsappClickResult,
    leadResult,
  ] = await Promise.all([
    supabase.from("Service").select("*", { count: "exact", head: true }).eq("vendorId", vendorId),
    supabase.from("Offer").select("*", { count: "exact", head: true }).eq("vendorId", vendorId),
    supabase.from("Offer").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("isActive", true),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "VIEW"),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "CONTACT_REVEAL"),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "WHATSAPP_CLICK"),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "LEAD"),
  ]);

  assertSupabase(serviceResult.data, serviceResult.error, "Failed to fetch dashboard service count");
  assertSupabase(offerResult.data, offerResult.error, "Failed to fetch dashboard offer count");
  assertSupabase(activeOfferResult.data, activeOfferResult.error, "Failed to fetch active offer count");
  assertSupabase(viewResult.data, viewResult.error, "Failed to fetch view count");
  assertSupabase(contactRevealResult.data, contactRevealResult.error, "Failed to fetch contact reveal count");
  assertSupabase(whatsappClickResult.data, whatsappClickResult.error, "Failed to fetch whatsapp click count");
  assertSupabase(leadResult.data, leadResult.error, "Failed to fetch lead count");

  return {
    totalServices: serviceResult.count ?? 0,
    totalOffers: offerResult.count ?? 0,
    activeOffers: activeOfferResult.count ?? 0,
    totalViews: viewResult.count ?? 0,
    totalContactReveals: contactRevealResult.count ?? 0,
    totalWhatsappClicks: whatsappClickResult.count ?? 0,
    totalLeads: leadResult.count ?? 0,
  };
};
