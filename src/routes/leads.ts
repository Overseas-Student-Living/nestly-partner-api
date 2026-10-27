// src/routes/leads.ts
//
// One endpoint for leads across everything the caller owns, with an
// optional `?listing_id=` filter rather than separate per-listing paths.

import { Router } from "express";
import db from "../db";
import { err, requireAuth } from "../middleware/auth";

const router = Router();

router.get("/leads", requireAuth, (req, res) => {
  const user = req.user!;
  const myListingIds = db.listings.filter((p) => p.owner_id === user.id).map((p) => p.id);

  const listing_id = typeof req.query.listing_id === "string" ? req.query.listing_id : undefined;
  if (listing_id) {
    const listing = db.listings.find((p) => p.id === listing_id);
    if (!listing) return err(res, 404, "not_found", "Listing not found.");
    if (listing.owner_id !== user.id) return err(res, 403, "forbidden", "You do not own this listing.");
  }

  const results = db.leads
    .filter((l) => myListingIds.includes(l.listing_id))
    .filter((l) => !listing_id || l.listing_id === listing_id)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  res.json({ data: results, meta: { count: results.length } });
});

export default router;
