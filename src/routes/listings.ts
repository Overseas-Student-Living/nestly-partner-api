// src/routes/listings.ts
//
// A landlord's own listings: create, read, update (fields, publish state
// and contact visibility all go through one PATCH), amenities, media,
// reviews and per-listing insights. Every `:listing_id` route is scoped to
// the caller via requireOwnedListing.

import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import db from "../db";
import { err, requireAuth } from "../middleware/auth";
import type { Listing, ListingStatus, MediaItem } from "../types";

const router = Router();

function requireOwnedListing(req: Request, res: Response, next: NextFunction) {
  const listing = db.listings.find((p) => p.id === req.params.listing_id);
  if (!listing) return err(res, 404, "not_found", "Listing not found.");
  if (listing.owner_id !== req.user!.id) return err(res, 403, "forbidden", "You do not own this listing.");
  req.listing = listing;
  next();
}

const EDITABLE_FIELDS = [
  "name", "address", "city", "state", "country", "postal_code", "latitude", "longitude",
  "contact_phone", "contact_email", "website", "price_from", "price_to", "currency",
  "billing_period", "property_type", "description", "nearest_university",
  "distance_to_university_km", "floorplans", "contact_hidden",
] as const satisfies readonly (keyof Listing)[];

const STATUSES: readonly ListingStatus[] = ["draft", "published", "unpublished"];

// The landlord's own listings — the portfolio screen.
router.get("/listings/mine", requireAuth, (req, res) => {
  const mine = db.listings.filter((p) => p.owner_id === req.user!.id);
  res.json({ data: mine, meta: { count: mine.length } });
});

// Create a listing from the landlord's self-service form. Starts as draft.
router.post("/listings", requireAuth, (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.address) {
    return err(res, 422, "validation_error", "name and address are required.");
  }

  const now = new Date().toISOString();
  const listing: Listing = {
    id: `prop_${randomUUID().slice(0, 6)}`,
    owner_id: req.user!.id,
    name: body.name,
    slug: body.slug || String(body.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
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
    created_at: now,
    updated_at: now,
  };

  db.listings.push(listing);
  res.status(201).json(listing);
});

// The full record, for the edit-listing screen.
router.get("/listings/:listing_id", requireAuth, requireOwnedListing, (req, res) => {
  res.json(req.listing);
});

// Send only the fields you want to change:
//   { "status": "published" | "draft" | "unpublished", "contact_hidden": bool, ...any editable field }
router.patch("/listings/:listing_id", requireAuth, requireOwnedListing, (req, res) => {
  const listing = req.listing!;
  const body = req.body || {};

  for (const key of EDITABLE_FIELDS) {
    if (key in body) (listing as unknown as Record<string, unknown>)[key] = body[key];
  }

  if ("status" in body) {
    if (!STATUSES.includes(body.status)) {
      return err(res, 422, "validation_error", `status must be one of: ${STATUSES.join(", ")}`);
    }
    listing.status = body.status;
  }

  listing.updated_at = new Date().toISOString();
  res.json(listing);
});

// Replace the amenities list wholesale.
router.put("/listings/:listing_id/amenities", requireAuth, requireOwnedListing, (req, res) => {
  const listing = req.listing!;
  const amenities = (req.body || {}).amenities;
  if (!Array.isArray(amenities)) {
    return err(res, 422, "validation_error", "amenities must be an array.");
  }
  listing.amenities = amenities;
  listing.updated_at = new Date().toISOString();
  res.json({ listing_id: listing.id, amenities: listing.amenities });
});

// Returns a fake upload URL — nothing is actually uploaded anywhere in the
// sandbox.
router.post("/listings/:listing_id/media/upload-url", requireAuth, requireOwnedListing, (req, res) => {
  const listing = req.listing!;
  const { filename, content_type } = req.body || {};
  if (!filename || !content_type) {
    return err(res, 422, "validation_error", "filename and content_type are required.");
  }
  const storageKey = `listings/${listing.id}/${Date.now()}-${filename}`;
  res.json({
    listing_id: listing.id,
    storage_key: storageKey,
    upload_url: `https://mock-media.example.com/upload/${encodeURIComponent(storageKey)}?stub-signature=demo`,
  });
});

// Registers a media record. Does not verify the file was actually uploaded
// to the URL above.
router.post("/listings/:listing_id/media", requireAuth, requireOwnedListing, (req, res) => {
  const listing = req.listing!;
  const { url, media_type, caption } = req.body || {};
  const media: MediaItem = {
    id: `media_${randomUUID().slice(0, 6)}`,
    url: url || `https://picsum.photos/seed/${listing.id}-${listing.images.length}/1200/800`,
    media_type: media_type || null,
    caption: caption || null,
  };
  listing.images.push(media);
  listing.updated_at = new Date().toISOString();
  res.status(201).json(media);
});

router.delete("/listings/:listing_id/media/:media_id", requireAuth, requireOwnedListing, (req, res) => {
  const listing = req.listing!;
  const before = listing.images.length;
  listing.images = listing.images.filter((m) => m.id !== req.params.media_id);
  if (listing.images.length === before) {
    return err(res, 404, "not_found", "Media item not found on this listing.");
  }
  listing.updated_at = new Date().toISOString();
  res.status(204).send();
});

router.get("/listings/:listing_id/reviews", requireAuth, requireOwnedListing, (req, res) => {
  const reviews = db.reviews.filter((r) => r.listing_id === req.listing!.id);
  res.json({ data: reviews, meta: { count: reviews.length } });
});

// Per-listing performance summary, so a landlord knows where to focus.
router.get("/listings/:listing_id/insights", requireAuth, requireOwnedListing, (req, res) => {
  const listing = req.listing!;
  const leads = db.leads.filter((l) => l.listing_id === listing.id);
  const reviews = db.reviews.filter((r) => r.listing_id === listing.id);
  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2))
      : listing.avg_rating;

  res.json({
    listing_id: listing.id,
    status: listing.status,
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
    photo_count: listing.images.length,
  });
});

export default router;
