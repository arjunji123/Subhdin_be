import type {
  OfferCreateInput,
  OfferUpdateInput,
  ServiceCreateInput,
  ServiceUpdateInput,
  VendorProfileInput,
} from "@shaadihub/shared";

import { supabase } from "../../lib/supabase.js";
import { AppError } from "../../utils/app-error.js";

export const getVendorMe = async (vendorId: string) => {
  const { data: vendor, error } = await supabase
    .from("Vendor")
    .select("*, services:Service(*), offers:Offer(*)")
    .eq("id", vendorId)
    .single();

  if (error || !vendor) throw new AppError("Vendor not found", 404);
  return vendor;
};

export const updateVendorMe = async (vendorId: string, payload: VendorProfileInput) => {
  const { data, error } = await supabase
    .from("Vendor")
    .update(payload)
    .eq("id", vendorId)
    .select()
    .single();

  if (error) throw new AppError("Failed to update vendor", 500);
  return data;
};

export const deleteVendorMe = async (vendorId: string) => {
  // Cascade delete all related records manually
  await Promise.all([
    supabase.from("AnalyticsEvent").delete().eq("vendorId", vendorId),
    supabase.from("OtpSession").delete().eq("vendorId", vendorId),
    supabase.from("Review").delete().eq("vendorId", vendorId),
    supabase.from("Service").delete().eq("vendorId", vendorId),
    supabase.from("Offer").delete().eq("vendorId", vendorId),
  ]);

  const { error } = await supabase.from("Vendor").delete().eq("id", vendorId);
  if (error) throw new AppError("Failed to delete vendor", 500);
  return { message: "Account and all related data deleted successfully" };
};

export const listServices = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("Service")
    .select("*")
    .eq("vendorId", vendorId)
    .order("createdAt", { ascending: false });

  if (error) throw new AppError("Failed to fetch services", 500);
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

  if (error) throw new AppError("Failed to create service", 500);
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

  if (error) throw new AppError("Service not found or update failed", 404);
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

  if (error) throw new AppError("Failed to fetch offers", 500);
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

  if (error) throw new AppError("Failed to create offer", 500);
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

  if (error) throw new AppError("Offer not found or update failed", 404);
  return data;
};

export const deleteOffer = async (vendorId: string, offerId: string) => {
  const { error } = await supabase
    .from("Offer")
    .delete()
    .eq("id", offerId)
    .eq("vendorId", vendorId);

  if (error) throw new AppError("Offer not found or delete failed", 404);
  return { message: "Offer deleted successfully" };
};

export const getDashboard = async (vendorId: string) => {
  const [
    { count: totalServices },
    { count: totalOffers },
    { count: activeOffers },
    { count: totalViews },
    { count: totalContactReveals },
    { count: totalWhatsappClicks },
    { count: totalLeads },
  ] = await Promise.all([
    supabase.from("Service").select("*", { count: "exact", head: true }).eq("vendorId", vendorId),
    supabase.from("Offer").select("*", { count: "exact", head: true }).eq("vendorId", vendorId),
    supabase.from("Offer").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("isActive", true),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "VIEW"),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "CONTACT_REVEAL"),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "WHATSAPP_CLICK"),
    supabase.from("AnalyticsEvent").select("*", { count: "exact", head: true }).eq("vendorId", vendorId).eq("type", "LEAD"),
  ]);

  return {
    totalServices: totalServices ?? 0,
    totalOffers: totalOffers ?? 0,
    activeOffers: activeOffers ?? 0,
    totalViews: totalViews ?? 0,
    totalContactReveals: totalContactReveals ?? 0,
    totalWhatsappClicks: totalWhatsappClicks ?? 0,
    totalLeads: totalLeads ?? 0,
  };
};
