import { Router } from "express";

import { swaggerRouter } from "../docs/swagger.routes.js";
import { analyticsRouter } from "../modules/analytics/analytics.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { uploadsRouter } from "../modules/uploads/uploads.routes.js";
import { userRouter } from "../modules/user/user.routes.js";
import { vendorRouter, vendorPublicRouter } from "../modules/vendor/vendor.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

apiRouter.use("/swagger", swaggerRouter);

apiRouter.use("/auth", authRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/vendor", vendorRouter);
apiRouter.use("/vendors", vendorPublicRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/uploads", uploadsRouter);
