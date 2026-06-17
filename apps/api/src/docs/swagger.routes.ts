import { Router } from "express";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const swaggerUi = require("swagger-ui-express");

import { swaggerSpec } from "./swagger-spec.js";

export const swaggerRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Subhdin API Docs",
  customfavIcon: "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png",
}));

// Serve the raw OpenAPI JSON for tooling / Postman import
swaggerRouter.get("/json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});