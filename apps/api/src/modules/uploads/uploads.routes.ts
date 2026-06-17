import crypto from "crypto";

import { Router } from "express";

import { env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";
import { AppError } from "../../utils/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const uploadsRouter = Router();

uploadsRouter.get(
  "/signature",
  requireAuth,
  asyncHandler(async (_req, res) => {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new AppError("Cloudinary is not configured", 500);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "subhdin/vendors";
    const toSign = `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;

    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    res.status(200).json({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  }),
);
