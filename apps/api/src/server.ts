import { app } from "./app.js";
import { env } from "./config/env.js";

export default app;

// Only listen locally, not on Vercel serverless
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}
