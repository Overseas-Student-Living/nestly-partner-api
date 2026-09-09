// src/routes/leads.js
//
// Renamed and restructured from the source API's `enquiries` endpoints.
// The source exposes separate paths for "all enquiries for one property"
// vs "all enquiries for the current user" — here that's one endpoint with
// an optional query filter instead, which is both a simpler contract and a
// deliberately different route shape from the source (see
// docs/SECURITY_NOTE.md).

const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, err } = require("../middleware/auth");

router.get("/leads", requireAuth, (req, res) => {
  const myListingIds = db.listings.filter((p) => p.owner_id === req.user.id).map((p) => p.id);

  const { listing_id } = req.query;
  if (listing_id) {
    const listing = db.listings.find((p) => p.id === listing_id);
    if (!listing) return err(res, 404, "not_found", "Listing not found.");
    if (listing.owner_id !== req.user.id) return err(res, 403, "forbidden", "You do not own this listing.");
  }

  const results = db.leads
    .filter((l) => myListingIds.includes(l.listing_id))
    .filter((l) => !listing_id || l.listing_id === listing_id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ data: results, meta: { count: results.length } });
});

module.exports = router;
