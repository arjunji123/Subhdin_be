import {
  offerCreateSchema,
  offerUpdateSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  vendorProfileSchema,
} from "@subhdin/shared";
import type { Request, Response } from "express";

import { AppError } from "../../utils/app-error.js";
import {
  createOffer,
  createService,
  deleteOffer,
  deleteService,
  deleteVendorMe,
  getDashboard,
  getPublicVendorDetail,
  getVendorMe,
  listOffers,
  listPublicOffers,
  listPublicVendors,
  listServices,
  listVendorServices,
  updateOffer,
  updateService,
  updateVendorMe,
} from "./vendor.service.js";

const getVendorId = (req: Request): string => {
  const vendorId = req.auth?.vendorId;
  if (!vendorId) {
    throw new AppError("Vendor authentication required", 401);
  }
  return vendorId;
};

const requiredParam = (value: string | string[] | undefined, fieldName: string) => {
  if (!value || Array.isArray(value)) {
    throw new AppError(`${fieldName} is required`, 400);
  }
  return value;
};

export const getVendorMeHandler = async (req: Request, res: Response) => {
  const vendor = await getVendorMe(getVendorId(req));
  return res.status(200).json(vendor);
};

export const updateVendorMeHandler = async (req: Request, res: Response) => {
  const payload = vendorProfileSchema.parse(req.body);
  const vendor = await updateVendorMe(getVendorId(req), payload);
  return res.status(200).json(vendor);
};

export const deleteVendorMeHandler = async (req: Request, res: Response) => {
  const result = await deleteVendorMe(getVendorId(req));
  return res.status(200).json(result);
};

export const listPublicVendorsHandler = async (req: Request, res: Response) => {
  const category = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const location = typeof req.query.location === "string" ? req.query.location.trim() : undefined;
  const budget = typeof req.query.budget === "string" ? Number(req.query.budget) : undefined;
  const minPrice = typeof req.query.minPrice === "string" ? Number(req.query.minPrice) : undefined;
  const maxPrice = typeof req.query.maxPrice === "string" ? Number(req.query.maxPrice) : undefined;
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy.trim() : undefined;

  const vendors = await listPublicVendors({
    category,
    search,
    location,
    budget,
    minPrice,
    maxPrice,
    sortBy,
  });

  return res.status(200).json(vendors);
};

export const getPublicVendorDetailHandler = async (req: Request, res: Response) => {
  const vendorId = requiredParam(req.params.vendorId, "vendorId");
  const detail = await getPublicVendorDetail(vendorId);
  return res.status(200).json(detail);
};

export const listVendorServicesHandler = async (req: Request, res: Response) => {
  const vendorId = requiredParam(req.params.vendorId, "vendorId");
  const services = await listVendorServices(vendorId);
  return res.status(200).json(services);
};

export const listServicesHandler = async (req: Request, res: Response) => {
  const services = await listServices(getVendorId(req));
  return res.status(200).json(services);
};

export const createServiceHandler = async (req: Request, res: Response) => {
  const payload = serviceCreateSchema.parse(req.body);
  const service = await createService(getVendorId(req), payload);
  return res.status(201).json(service);
};

export const updateServiceHandler = async (req: Request, res: Response) => {
  const payload = serviceUpdateSchema.parse(req.body);
  const serviceId = requiredParam(req.params.serviceId, "serviceId");
  const service = await updateService(getVendorId(req), serviceId, payload);
  return res.status(200).json(service);
};

export const deleteServiceHandler = async (req: Request, res: Response) => {
  const serviceId = requiredParam(req.params.serviceId, "serviceId");
  const result = await deleteService(getVendorId(req), serviceId);
  return res.status(200).json(result);
};

export const listOffersHandler = async (req: Request, res: Response) => {
  const offers = await listOffers(getVendorId(req));
  return res.status(200).json(offers);
};

export const createOfferHandler = async (req: Request, res: Response) => {
  const payload = offerCreateSchema.parse(req.body);
  const offer = await createOffer(getVendorId(req), payload);
  return res.status(201).json(offer);
};

export const updateOfferHandler = async (req: Request, res: Response) => {
  const payload = offerUpdateSchema.parse(req.body);
  const offerId = requiredParam(req.params.offerId, "offerId");
  const offer = await updateOffer(getVendorId(req), offerId, payload);
  return res.status(200).json(offer);
};

export const deleteOfferHandler = async (req: Request, res: Response) => {
  const offerId = requiredParam(req.params.offerId, "offerId");
  const result = await deleteOffer(getVendorId(req), offerId);
  return res.status(200).json(result);
};

export const listPublicOffersHandler = async (_req: Request, res: Response) => {
  const offers = await listPublicOffers();
  return res.status(200).json(offers);
};

export const dashboardHandler = async (req: Request, res: Response) => {
  const data = await getDashboard(getVendorId(req));
  return res.status(200).json(data);
};
