import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createOfferHandler,
  createServiceHandler,
  dashboardHandler,
  deleteOfferHandler,
  deleteServiceHandler,
  deleteVendorMeHandler,
  getVendorMeHandler,
  listOffersHandler,
  listPublicVendorsHandler,
  listServicesHandler,
  listVendorServicesHandler,
  updateOfferHandler,
  updateServiceHandler,
  updateVendorMeHandler,
} from "./vendor.controller.js";

import { createReviewHandler, listReviewsHandler } from "./reviews.controller.js";

export const vendorRouter = Router();
export const vendorPublicRouter = Router();

vendorRouter.use(requireAuth);

vendorRouter.get("/me", asyncHandler(getVendorMeHandler));
vendorRouter.put("/me", asyncHandler(updateVendorMeHandler));
vendorRouter.delete("/me", asyncHandler(deleteVendorMeHandler));

vendorRouter.get("/services", asyncHandler(listServicesHandler));
vendorRouter.post("/services", asyncHandler(createServiceHandler));
vendorRouter.patch("/services/:serviceId", asyncHandler(updateServiceHandler));
vendorRouter.delete("/services/:serviceId", asyncHandler(deleteServiceHandler));

vendorPublicRouter.get("/", asyncHandler(listPublicVendorsHandler));
vendorPublicRouter.get("/:vendorId/services", asyncHandler(listVendorServicesHandler));

vendorRouter.get("/offers", asyncHandler(listOffersHandler));
vendorRouter.post("/offers", asyncHandler(createOfferHandler));
vendorRouter.patch("/offers/:offerId", asyncHandler(updateOfferHandler));
vendorRouter.delete("/offers/:offerId", asyncHandler(deleteOfferHandler));

vendorRouter.get("/reviews", asyncHandler(listReviewsHandler));
vendorRouter.post("/reviews", asyncHandler(createReviewHandler));
vendorRouter.get("/dashboard", asyncHandler(dashboardHandler));
