import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { loginRequestOtpHandler, requestOtpHandler, verifyOtpHandler } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/request-otp", asyncHandler(requestOtpHandler));
authRouter.post("/login-request-otp", asyncHandler(loginRequestOtpHandler));
authRouter.post("/verify-otp", asyncHandler(verifyOtpHandler));
