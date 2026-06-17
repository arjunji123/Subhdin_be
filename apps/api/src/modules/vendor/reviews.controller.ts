import { reviewSchema } from "@subhdin/shared";
import type { Request, Response } from "express";

import { createReview, listReviews } from "./reviews.service.js";

const getVendorId = (req: Request) => req.auth!.vendorId;

export const listReviewsHandler = async (req: Request, res: Response) => {
  const reviews = await listReviews(getVendorId(req));
  return res.status(200).json(reviews);
};

export const createReviewHandler = async (req: Request, res: Response) => {
  const payload = reviewSchema.parse(req.body);
  const userName = req.body.userName as string | undefined;
  const review = await createReview(getVendorId(req), payload, userName);
  return res.status(201).json(review);
};