import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed",
      issues: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    console.error("AppError:", err.message, { statusCode: err.statusCode, details: err.details });
    const response: { message: string; details?: unknown } = { message: err.message };
    if (process.env.NODE_ENV !== "production" && err.details) {
      response.details = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({ message: "Internal server error" });
};
