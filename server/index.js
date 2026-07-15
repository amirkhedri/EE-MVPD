import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

import { getDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import nurseRoutes from "./routes/nurses.js";
import requestRoutes from "./routes/requests.js";
import contractRoutes from "./routes/contracts.js";
import walletRoutes from "./routes/wallet.js";
import careLogRoutes from "./routes/careLog.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/nurses", nurseRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/care-log", careLogRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// In production, this same server also serves the built React app, so the
// whole site (frontend + API) lives behind a single free host/URL with no
// CORS setup needed. Run `npm run build` before starting in this mode.
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.join(__dirname, "..", "dist");
  app.use(express.static(distDir));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// Centralized error handler so unexpected failures return JSON, not HTML.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

await getDb();

// Only listen to a port if we are running locally, NOT on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CareLink API listening on http://localhost:${PORT}`);
  });
}

export default app;