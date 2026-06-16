import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

type AuthPayload = {
  vendorId: string;
};

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthPayload;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as unknown as AuthPayload;
    if (!payload.vendorId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
