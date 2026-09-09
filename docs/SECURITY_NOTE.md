# Why this API doesn't mirror production 1:1

This mock started life as a renamed copy of a real Student.com production
API spec, with only the *data* anonymized. That turned out not to be
enough. Even with every name and value fictionalized, an API whose paths,
HTTP verbs, field names, response envelope, and error format match a real
system 1:1 is effectively a map of that system's surface — anyone with
this repo would know exactly which URLs, methods, and parameters to try
against the real thing, without needing anything else from us.

So this version is a **restructured reimplementation**, not a renamed
clone. Concretely, compared to a straight rename:

- **Resource names changed**: `properties` → `listings`, `enquiries` →
  `leads`, `auth` → `accounts`, `dashboard` → `overview`, `images` →
  `media`, `jobs` → `tasks`.
- **Routes were merged and re-verbed**, not just renamed. The source
  system has five separate action-endpoints for updating a property
  (`update`, `publish`, `unpublish`, `hide-contact-details`,
  `unhide-contact-details`). Here that's a single `PATCH /listings/:id`
  that takes whichever fields changed. Amenities use `PUT` instead of a
  bespoke `set-amenities` action path. Enquiry filtering uses a query
  parameter (`GET /leads?listing_id=`) instead of two separate
  path-scoped endpoints.
- **Field names changed** on anything distinctive enough to fingerprint
  the source schema: `zip_code`→`postal_code`, `min_price`/`max_price`→
  `price_from`/`price_to`, `closest_university`→`nearest_university`,
  `rating`/`user_rating_count`→`avg_rating`/`review_count`,
  `phone_number`→`phone`/`contact_phone`, `property_id`→`listing_id`.
- **Response envelope changed**: list endpoints return `{ "data": [...],
  "meta": { "count": n } }` instead of the source's ad hoc shapes.
- **Error format changed**: `{ "error": { "code", "message" } }` instead
  of the source's FastAPI/Pydantic-style `{ "detail": [...] }` validation
  errors — that exact shape is itself a fingerprint of the framework
  behind it.
- **Auth token format changed**: `sandbox-session.<user_id>`, unique to
  this mock, not resembling any real token scheme.
- **IDs stay in a different format** (`prop_xxxxxx` / `usr_xxxxxxxx`)
  rather than the UUIDs the source system uses.
- **Internal/ops-only endpoints excluded entirely** (bulk scraping,
  enrichment pipelines, moderation tooling, admin bulk operations) — not
  just because they're irrelevant to a landlord app, but because their
  existence and shape is itself information about production we don't
  need to publish.

## What this means for you

- **Never point a client built against this mock at any real Student.com
  hostname.** This mock only exists on `localhost` (or wherever you choose
  to self-host it) — it is not, and should never become, reachable at any
  production-like domain.
- If you're extending this mock (see `CONTRIBUTING.md`), keep new
  endpoints in the same restructured style — don't reintroduce
  production-shaped paths, field names, or error formats "for realism."
  Realism for the judged app is about UX and error handling, not about how
  closely the wire format matches a system you don't have access to.
- If you ever come across information that looks like it reveals real
  production infrastructure (a real hostname, a real internal service
  name, a real credential) anywhere in this repo or in anything shared
  as part of the competition, stop and report it to the organizers rather
  than using or publishing it.
