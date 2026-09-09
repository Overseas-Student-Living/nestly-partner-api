// src/routes/listings.js
//
// Renamed and restructured from the source API's `properties` endpoints.
// This is not a renamed clone: several separate source action-endpoints
// (update / publish / unpublish / hide-contact-details /
// unhide-contact-details) are deliberately merged into one PATCH here,
// resource and field names differ, and the media endpoints use different
// naming than the source's image endpoints. See docs/SECURITY_NOTE.md for
// why the shape was changed, and CONTRIBUTING.md for the provenance-tag
// convention used below.
//
//   [BASED-ON] -> loosely inspired by a real endpoint, reshaped
//   [ADDED]    -> did not exist in the source API at all

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { requireAuth, err } = require("../middleware/auth");

function requireOwnedListing(req, res, next) {
  const listing = db.listings.find((p) => p.id === req.params.listing_id);
  if (!listing) return err(res, 404, "not_found", "Listing not found.");
  if (listing.owner_id !== req.user.id) return err(res, 403, "forbidden", "You do not own this listing.");
  req.listing = listing;
  next();
}

// [ADDED] A landlord's own listings. The source API has no landlord
// persona — only admin/bulk listing management and student-facing search —
// so "listings belonging to me" has no equivalent there.
router.get("/listings/mine", requireAuth, (req, res) => {
  const mine = db.listings.filter((p) => p.owner_id === req.user.id);
  res.json({ data: mine, meta: { count: mine.length } });
});

// [ADDED] Create a listing. The source's creation paths bulk-generate
// listings from third-party place data for internal ops use — not a
// landlord self-service form.
router.post("/listings", requireAuth, (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.address) {
    return err(res, 422, "validation_error", "name and address are required.");
  }

  const id = `prop_${uuidv4().slice(0, 6)}`;
  const listing = {
    id,
    owner_id: req.user.id,
    name: body.name,
    slug: body.slug || body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
    status: "draft",
    address: body.address,
    city: body.city || null,
    state: body.state || null,
    country: body.country || null,
    postal_code: body.postal_code || null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    nearest_university: body.nearest_university || null,
    distance_to_university_km: body.distance_to_university_km ?? null,
    property_type: body.property_type || null,
    price_from: body.price_from ?? null,
    price_to: body.price_to ?? null,
    currency: body.currency || "GBP",
    billing_period: body.billing_period || "week",
    contact_phone: body.contact_phone || null,
    contact_email: body.contact_email || null,
    website: body.website || null,
    contact_hidden: false,
    description: body.description || null,
    amenities: [],
    floorplans: body.floorplans || [],
    images: [],
    avg_rating: null,
    review_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.listings.push(listing);
  res.status(201).json(listing);
});

// [ADDED] Fetch a single listing. The source API has search results and a
// few slug-scoped sub-resources, but no plain "get one property" — a
// landlord editing a listing needs the full record on demand.
router.get("/listings/:listing_id", requireAuth, requireOwnedListing, (req, res) => {
  res.json(req.listing);
});

// [BASED-ON] merges the source's separate update / publish / unpublish /
// hide-contact-details / unhide-contact-details action-endpoints into one
// standard PATCH. Send only the fields you want to change:
//   { "status": "published" | "draft" | "unpublished", "contact_hidden": bool, ...any editable field }
router.patch("/listings/:listing_id", requireAuth, requireOwnedListing, (req, res) => {
  const editable = [
    "name", "address", "city", "state", "country", "postal_code", "latitude", "longitude",
    "contact_phone", "contact_email", "website", "price_from", "price_to", "currency",
    "billing_period", "property_type", "description", "nearest_university",
    "distance_to_university_km", "floorplans", "contact_hidden",
  ];
  const body = req.body || {};

  for (const key of editable) {
    if (key in body) req.listing[key] = body[key];
  }

  if ("status" in body) {
    const allowedStatuses = ["draft", "published", "unpublished"];
    if (!allowedStatuses.includes(body.status)) {
      return err(res, 422, "validation_error", `status must be one of: ${allowedStatuses.join(", ")}`);
    }
    req.listing.status = body.status;
  }

  req.listing.updated_at = new Date().toISOString();
  res.json(req.listing);
});

// [BASED-ON] source's set-amenities action-endpoint, using PUT (replace)
// instead of a bespoke POST action path.
router.put("/listings/:listing_id/amenities", requireAuth, requireOwnedListing, (req, res) => {
  const amenities = (req.body || {}).amenities;
  if (!Array.isArray(amenities)) {
    return err(res, 422, "validation_error", "amenities must be an array.");
  }
  req.listing.amenities = amenities;
  req.listing.updated_at = new Date().toISOString();
  res.json({ listing_id: req.listing.id, amenities: req.listing.amenities });
});

// [BASED-ON] source's presign-image-url endpoint, renamed to the "media"
// resource. Returns a fake upload URL — nothing is actually uploaded
// anywhere in the sandbox.
router.post("/listings/:listing_id/media/upload-url", requireAuth, requireOwnedListing, (req, res) => {
  const { filename, content_type } = req.body || {};
  if (!filename || !content_type) {
    return err(res, 422, "validation_error", "filename and content_type are required.");
  }
  const storageKey = `listings/${req.listing.id}/${Date.now()}-${filename}`;
  res.json({
    listing_id: req.listing.id,
    storage_key: storageKey,
    upload_url: `https://mock-media.example.com/upload/${encodeURIComponent(storageKey)}?stub-signature=demo`,
  });
});

// [BASED-ON] source's upload-image endpoint — registers a media record.
// Does not verify the file was actually uploaded to the URL above.
router.post("/listings/:listing_id/media", requireAuth, requireOwnedListing, (req, res) => {
  const { url, media_type, caption } = req.body || {};
  const media = {
    id: `media_${uuidv4().slice(0, 6)}`,
    url: url || `https://picsum.photos/seed/${req.listing.id}-${req.listing.images.length}/1200/800`,
    media_type: media_type || null,
    caption: caption || null,
  };
  req.listing.images.push(media);
  req.listing.updated_at = new Date().toISOString();
  res.status(201).json(media);
});

// [BASED-ON] source's delete-image endpoint.
router.delete("/listings/:listing_id/media/:media_id", requireAuth, requireOwnedListing, (req, res) => {
  const before = req.listing.images.length;
  req.listing.images = req.listing.images.filter((m) => m.id !== req.params.media_id);
  if (req.listing.images.length === before) {
    return err(res, 404, "not_found", "Media item not found on this listing.");
  }
  req.listing.updated_at = new Date().toISOString();
  res.status(204).send();
});

// [BASED-ON] source's per-property reviews endpoint.
router.get("/listings/:listing_id/reviews", requireAuth, requireOwnedListing, (req, res) => {
  const reviews = db.reviews.filter((r) => r.listing_id === req.listing.id);
  res.json({ data: reviews, meta: { count: reviews.length } });
});

// [BASED-ON] a simplified, single-listing version of the source's
// portfolio-wide admin analytics/stats endpoints.
router.get("/listings/:listing_id/insights", requireAuth, requireOwnedListing, (req, res) => {
  const leads = db.leads.filter((l) => l.listing_id === req.listing.id);
  const reviews = db.reviews.filter((r) => r.listing_id === req.listing.id);
  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2))
      : req.listing.avg_rating;

  res.json({
    listing_id: req.listing.id,
    status: req.listing.status,
    leads: {
      total: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      responded: leads.filter((l) => l.status === "responded").length,
      closed: leads.filter((l) => l.status === "closed").length,
    },
    reviews: {
      total: reviews.length,
      avg_rating: avgRating,
    },
    photo_count: req.listing.images.length,
  });
});

module.exports = router;
