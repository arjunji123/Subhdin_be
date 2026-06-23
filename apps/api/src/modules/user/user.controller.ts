import { userProfileSchema } from "@subhdin/shared";
import type { Request, Response } from "express";

import { AppError } from "../../utils/app-error.js";
import { deleteUserMe, getUserMe, updateUserMe } from "./user.service.js";

const getUserId = (req: Request): string => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("User authentication required", 401);
  }
  return userId;
};

export const getUserMeHandler = async (req: Request, res: Response) => {
  const user = await getUserMe(getUserId(req));
  return res.status(200).json(user);
};

export const updateUserMeHandler = async (req: Request, res: Response) => {
  const payload = userProfileSchema.parse(req.body);
  const user = await updateUserMe(getUserId(req), payload);
  return res.status(200).json(user);
};

export const deleteUserMeHandler = async (req: Request, res: Response) => {
  const result = await deleteUserMe(getUserId(req));
  return res.status(200).json(result);
};
