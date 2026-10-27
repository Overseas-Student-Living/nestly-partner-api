// src/routes/overview.ts
//
// Landlord home-screen summary: portfolio counts, the most recent leads,
// and listings that need attention.

import { Router } from "express";
import db from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/overview", requireAuth, (req, res) => {
  const user = req.user!;
  const myListings = db.listings.filter((p) => p.owner_id === user.id);
  const myListingIds = myListings.map((p) => p.id);
  const myLeads = db.leads.filter((l) => myListingIds.includes(l.listing_id));

  res.json({
    portfolio: {
      total: myListings.length,
      published: myListings.filter((p) => p.status === "published").length,
      draft: myListings.filter((p) => p.status === "draft").length,
    },
    recent_leads: myLeads
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
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

export default router;
