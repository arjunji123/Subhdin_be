import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { deleteUserMeHandler, getUserMeHandler, updateUserMeHandler } from "./user.controller.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", asyncHandler(getUserMeHandler));
userRouter.put("/me", asyncHandler(updateUserMeHandler));
userRouter.delete("/me", asyncHandler(deleteUserMeHandler));
