// Vercel root entrypoint — dynamically loads the compiled Express app at runtime
export default async function handler(req, res) {
  const { app } = await import("./apps/api/dist/app.js");
  return app(req, res);
}
