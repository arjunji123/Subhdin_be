import { requestOtpSchema, verifyOtpSchema } from "@shaadihub/shared";
import type { Request, Response } from "express";

import { requestOtp, verifyOtp } from "./auth.service.js";

export const requestOtpHandler = async (req: Request, res: Response) => {
  const payload = requestOtpSchema.parse(req.body);
  const result = await requestOtp(payload, "signup");
  return res.status(200).json(result);
};

export const loginRequestOtpHandler = async (req: Request, res: Response) => {
  const payload = requestOtpSchema.parse(req.body);
  const result = await requestOtp(payload, "login");
  return res.status(200).json(result);
};

export const verifyOtpHandler = async (req: Request, res: Response) => {
  const payload = verifyOtpSchema.parse(req.body);
  const result = await verifyOtp(payload);
  return res.status(200).json(result);
};
