import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requestOtpHandler, verifyOtpHandler } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/request-otp", asyncHandler(requestOtpHandler));
authRouter.post("/verify-otp", asyncHandler(verifyOtpHandler));
