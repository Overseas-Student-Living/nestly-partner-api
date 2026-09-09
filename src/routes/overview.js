// src/routes/overview.js
//
// Loosely based on the source API's student dashboard endpoint (a
// { title, data } "sections" list aimed at a student home screen). Same
// general idea — a mobile home-screen summary is a genuinely useful
// pattern — but renamed, re-scoped to landlord data, and reshaped.

const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

router.get("/overview", requireAuth, (req, res) => {
  const myListings = db.listings.filter((p) => p.owner_id === req.user.id);
  const myListingIds = myListings.map((p) => p.id);
  const myLeads = db.leads.filter((l) => myListingIds.includes(l.listing_id));

  res.json({
    portfolio: {
      total: myListings.length,
      published: myListings.filter((p) => p.status === "published").length,
      draft: myListings.filter((p) => p.status === "draft").length,
    },
    recent_leads: myLeads
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5),
    needs_attention: myListings
      .filter((p) => p.status === "draft" || p.images.length === 0)
      .map((p) => ({
        listing_id: p.id,
        name: p.name,
        reason: p.status === "draft" ? "not_published" : "no_photos",
      })),
  });
});

module.exports = router;
