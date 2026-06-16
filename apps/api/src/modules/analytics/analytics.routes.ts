import { analyticsEventSchema } from "@shaadihub/shared";
import { Router } from "express";

import { supabase } from "../../lib/supabase.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const analyticsRouter = Router();

analyticsRouter.post(
  "/events",
  asyncHandler(async (req, res) => {
    const payload = analyticsEventSchema.parse(req.body);

    const { data, error } = await supabase
      .from("AnalyticsEvent")
      .insert({
        vendorId: payload.vendorId,
        type: payload.type,
        source: payload.source,
        metadata: payload.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  }),
);
