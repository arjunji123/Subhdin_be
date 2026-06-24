import { reviewSchema } from "@subhdin/shared";
import type { Request, Response } from "express";

import { AppError } from "../../utils/app-error.js";
import { createReview, listReviews } from "./reviews.service.js";

const getVendorId = (req: Request): string => {
  const vendorId = typeof req.body?.vendorId === "string" && req.body.vendorId.trim()
    ? req.body.vendorId
    : req.auth?.vendorId;

  if (!vendorId) {
    throw new AppError("Vendor ID is required", 400);
  }

  return vendorId;
};

export const listReviewsHandler = async (req: Request, res: Response) => {
  const requestedVendorId = typeof req.query?.vendorId === "string" && req.query.vendorId.trim()
    ? req.query.vendorId
    : req.auth?.vendorId;

  if (!requestedVendorId) {
    throw new AppError("Vendor ID is required", 400);
  }

  const reviews = await listReviews(requestedVendorId);
  return res.status(200).json(reviews);
};

export const createReviewHandler = async (req: Request, res: Response) => {
  const payload = reviewSchema.parse(req.body);
  const userName = req.body.userName as string | undefined;
  const review = await createReview(getVendorId(req), payload, userName);
  return res.status(201).json(review);
};