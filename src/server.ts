// src/server.ts
//
// Nestly Partner API — mock server for the Nestly Landlord App competition.
// See README.md for the full brief. See CONTRIBUTING.md before adding
// endpoints.

import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";

import systemRoutes from "./routes/system";
import accountsRoutes from "./routes/accounts";
import listingsRoutes from "./routes/listings";
import leadsRoutes from "./routes/leads";
import overviewRoutes from "./routes/overview";

const app = express();
app.use(cors());
app.use(express.json());

// Tiny request logger — helpful when debugging against a mobile client.
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.use(systemRoutes);
app.use(accountsRoutes);
app.use(listingsRoutes);
app.use(leadsRoutes);
app.use(overviewRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: { code: "not_found", message: `No route for ${req.method} ${req.originalUrl}` },
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: { code: "internal_error", message: "Internal mock server error." } });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Nestly Partner API (mock) listening on http://localhost:${PORT}`);
  console.log(`Try: curl http://localhost:${PORT}/`);
});

export default app;
