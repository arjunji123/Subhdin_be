import type {
  OfferCreateInput,
  OfferUpdateInput,
  ServiceCreateInput,
  ServiceUpdateInput,
  VendorProfileInput,
} from "@subhdin/shared";

import { randomUUID } from "crypto";
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

type PublicVendorFilters = {
  category?: string;
  search?: string;
  location?: string;
  budget?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

export const buildReviewSummary = (reviews: Array<Record<string, unknown>>) => {
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / reviewCount
    : 0;

  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    const ratingValue = Number(review.rating ?? 0);
    if (ratingValue >= 1 && ratingValue <= 5) {
      ratingBreakdown[ratingValue as keyof typeof ratingBreakdown] += 1;
    }
  });

  return {
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount,
    ratingBreakdown,
  };
};

export const listPublicVendors = async (filters: PublicVendorFilters = {}) => {
  const { category, search, location, budget, minPrice, maxPrice, sortBy } = filters;

  let vendorQuery = supabase
    .from("Vendor")
    .select("*")
    .in("status", ["APPROVED", "PENDING"])
    .order("createdAt", { ascending: false });

  let vendorIds: string[] | undefined;

  if (category) {
    const { data: matchingServices, error: servicesError } = await supabase
      .from("Service")
      .select("vendorId")
      .ilike("category", `%${category}%`)
      .order("createdAt", { ascending: false });

    assertSupabase(matchingServices, servicesError, "Failed to fetch matching services");
    vendorIds = [...new Set((matchingServices ?? []).map((service) => service.vendorId))];
    if (vendorIds.length === 0) return [];
  }

  if (vendorIds?.length) {
    vendorQuery = vendorQuery.in("id", vendorIds);
  }

  const { data: vendors, error } = await vendorQuery;
  assertSupabase(vendors, error, "Failed to fetch vendor list");

  const vendorList = (vendors ?? []).map((vendor) => ({ ...vendor }));
  if (!vendorList.length) return [];

  const vendorIdsForDetails = vendorList.map((vendor) => vendor.id);
  const [servicesResult, reviewsResult] = await Promise.all([
    supabase.from("Service").select("*").in("vendorId", vendorIdsForDetails),
    supabase.from("Review").select("id, userName, rating, comment, createdAt").in("vendorId", vendorIdsForDetails),
  ]);

  assertSupabase(servicesResult.data, servicesResult.error, "Failed to fetch vendor services");
  assertSupabase(reviewsResult.data, reviewsResult.error, "Failed to fetch vendor reviews");

  const servicesByVendor = new Map<string, Array<Record<string, unknown>>>();
  (servicesResult.data ?? []).forEach((service) => {
    const vendorId = service.vendorId as string;
    const current = servicesByVendor.get(vendorId) ?? [];
    current.push(service);
    servicesByVendor.set(vendorId, current);
  });

  const reviewsByVendor = new Map<string, Array<Record<string, unknown>>>();
  (reviewsResult.data ?? []).forEach((review) => {
    const vendorId = (review as Record<string, unknown>).vendorId as string;
    const current = reviewsByVendor.get(vendorId) ?? [];
    current.push(review);
    reviewsByVendor.set(vendorId, current);
  });

  const normalizedSearch = normalize(search);
  const normalizedLocation = normalize(location);
  const maxBudget = budget ?? maxPrice;
  const effectiveMinPrice = minPrice;
  const effectiveMaxPrice = maxBudget ?? undefined;

  const filtered = vendorList.filter((vendor) => {
    const services = servicesByVendor.get(vendor.id) ?? [];
    const reviews = reviewsByVendor.get(vendor.id) ?? [];

    const matchesCategory = !category || services.some((service) => normalize(service.category as string).includes(normalize(category)));
    const matchesSearch = !normalizedSearch || [
      vendor.businessName,
      vendor.ownerName,
      vendor.city,
      vendor.area,
      vendor.address,
      services.map((service) => service.serviceName).join(" "),
      services.map((service) => service.description).join(" "),
    ].some((value) => normalize(value as string).includes(normalizedSearch));
    const matchesLocation = !normalizedLocation || [vendor.city, vendor.area, vendor.address].some((value) => normalize(value as string).includes(normalizedLocation));

    const servicePrices = services
      .map((service) => Number(service.price))
      .filter((price) => Number.isFinite(price));

    const matchesBudget = !effectiveMinPrice && !effectiveMaxPrice || servicePrices.some((price) => {
      const aboveMin = effectiveMinPrice === undefined || price >= effectiveMinPrice;
      const belowMax = effectiveMaxPrice === undefined || price <= effectiveMaxPrice;
      return aboveMin && belowMax;
    });

    return matchesCategory && matchesSearch && matchesLocation && matchesBudget;
  }).map((vendor) => {
    const services = servicesByVendor.get(vendor.id) ?? [];
    const reviews = reviewsByVendor.get(vendor.id) ?? [];
    const reviewSummary = buildReviewSummary(reviews as Array<Record<string, unknown>>);
    const minPriceValue = services.length > 0 ? Math.min(...services.map((service) => Number(service.price)).filter((price) => Number.isFinite(price))) : 0;
    const maxPriceValue = services.length > 0 ? Math.max(...services.map((service) => Number(service.price)).filter((price) => Number.isFinite(price))) : 0;

    return {
      ...vendor,
      services,
      reviews,
      reviewCount: reviewSummary.reviewCount,
      averageRating: reviewSummary.averageRating,
      ratingBreakdown: reviewSummary.ratingBreakdown,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      serviceCount: services.length,
      popularity: reviewSummary.reviewCount + services.length,
    };
  });

  const sortMode = normalize(sortBy);
  const sorted = [...filtered].sort((left, right) => {
    switch (sortMode) {
      case "rating":
        return (right.averageRating ?? 0) - (left.averageRating ?? 0);
      case "price_low_to_high":
        return (left.minPrice ?? 0) - (right.minPrice ?? 0);
      case "price_high_to_low":
        return (right.minPrice ?? 0) - (left.minPrice ?? 0);
      case "popularity":
        return (right.popularity ?? 0) - (left.popularity ?? 0);
      case "newest":
      default:
        return new Date(right.createdAt as string).getTime() - new Date(left.createdAt as string).getTime();
    }
  });

  return sorted;
};

export const getPublicVendorDetail = async (vendorId: string) => {
  const [vendorResult, servicesResult, reviewsResult] = await Promise.all([
    supabase.from("Vendor").select("*").eq("id", vendorId).in("status", ["APPROVED", "PENDING"]).single(),
    supabase.from("Service").select("*").eq("vendorId", vendorId).order("createdAt", { ascending: false }),
    supabase.from("Review").select("id, userName, rating, comment, createdAt").eq("vendorId", vendorId).order("createdAt", { ascending: false }),
  ]);

  assertSupabase(vendorResult.data, vendorResult.error, "Failed to fetch vendor detail");
  assertSupabase(servicesResult.data, servicesResult.error, "Failed to fetch vendor services");
  assertSupabase(reviewsResult.data, reviewsResult.error, "Failed to fetch vendor reviews");

  if (!vendorResult.data) throw new AppError("Vendor not found", 404);

  const reviewSummary = buildReviewSummary((reviewsResult.data ?? []) as Array<Record<string, unknown>>);

  return {
    vendor: {
      ...vendorResult.data,
      reviewSummary,
      reviewCount: reviewSummary.reviewCount,
      averageRating: reviewSummary.averageRating,
      ratingBreakdown: reviewSummary.ratingBreakdown,
    },
    services: servicesResult.data ?? [],
    reviews: reviewsResult.data ?? [],
  };
};

export const listVendorServices = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("Service")
    .select("*")
    .eq("vendorId", vendorId)
    .order("createdAt", { ascending: false });

  assertSupabase(data, error, "Failed to fetch vendor services");
  return data;
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
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("Service")
    .insert({
      id: randomUUID(),
      vendorId,
      category: payload.category,
      serviceName: payload.serviceName,
      description: payload.description,
      price: payload.price,
      capacity: payload.capacity,
      galleryImages: payload.galleryImages ?? [],
      videoUrls: payload.videoUrls ?? [],
      highlights: payload.highlights ?? [],
      createdAt: now,
      updatedAt: now,
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
  const { data, error } = await supabase
    .from("Service")
    .delete()
    .eq("id", serviceId)
    .eq("vendorId", vendorId)
    .select();

  assertSupabase(data, error, "Failed to delete service");
  const deletedData = data as unknown;
  if (!Array.isArray(deletedData) || deletedData.length === 0) throw new AppError("Service not found", 404);
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
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("Offer")
    .insert({
      id: randomUUID(),
      vendorId,
      title: payload.title,
      description: payload.description,
      discountPercent: payload.discountPercent,
      startDate: new Date(payload.startDate).toISOString(),
      endDate: new Date(payload.endDate).toISOString(),
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
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
    .eq("vendorId", vendorId)
    .select();

  assertSupabase(data, error, "Failed to delete offer");
  const deletedData = data as unknown;
  if (!Array.isArray(deletedData) || deletedData.length === 0) throw new AppError("Offer not found", 404);
  return { message: "Offer deleted successfully" };
};

// ============ PUBLIC OFFERS ============
export const listPublicOffers = async () => {
  // Fetch active offers with vendor details via join
  const { data: offers, error } = await supabase
    .from("Offer")
    .select(`
      *,
      vendor:Vendor!inner (
        id,
        businessName,
        ownerName,
        city,
        area,
        address,
        mobileNumber,
        email,
        businessImages,
        status
      )
    `)
    .eq("isActive", true)
    .order("createdAt", { ascending: false });

  assertSupabase(offers, error, "Failed to fetch public offers");
  return offers ?? [];
};

export const listPublicVendorOffers = async (vendorId: string) => {
  const { data, error } = await supabase
    .from("Offer")
    .select("*")
    .eq("vendorId", vendorId)
    .eq("isActive", true)
    .order("createdAt", { ascending: false });

  assertSupabase(data, error, "Failed to fetch public vendor offers");
  return data ?? [];
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
