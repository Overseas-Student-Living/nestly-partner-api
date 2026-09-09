# Adding endpoints to the mock API

This mock API covers a deliberately minimal landlord flow: signup/login,
manage your own listings, handle media and amenities, see leads, and an
overview summary. It will not cover everything your app idea needs — that's
expected. You're free to extend it.

**Read `docs/SECURITY_NOTE.md` first.** This mock's paths, verbs, field
names, response envelope, and error format were all deliberately
restructured away from the real production system it's loosely inspired
by — that's a security measure, not a style choice. New endpoints need to
follow the same restructured conventions below, not reach back toward
however the real system might do it.

Every existing route in `src/routes/` is commented with a provenance tag:

- **`[BASED-ON]`** — loosely inspired by a real endpoint from the source
  production API, reshaped (renamed, sometimes merged with others,
  different fields/verbs) for this sandbox.
- **`[ADDED]`** — didn't exist in the source API; added here because the
  landlord persona needed it and the reasoning is given inline.

If you add a new endpoint, follow the same pattern:

## 1. Write the reasoning first

At the top of your new route (or in your PR/submission notes if you're not
touching this repo directly), state in a sentence or two:

- **What the endpoint does.**
- **Why the landlord app needs it** — what screen or flow is broken or
  missing without it.
- **Why it's not better solved** by combining existing endpoints, or by
  deriving the data client-side from something already returned.

A one-line reason like "so I can show X on the Y screen" is enough — the
point is to show you thought about whether it earns its place, not to write
an essay.

## 2. Match the existing shape

- REST-ish paths, JSON in and out, same auth pattern (`Bearer
  sandbox-session.<user_id>` via `requireAuth`).
- Reuse `requireOwnedListing` (or equivalent ownership checks) for anything
  scoped to a specific landlord's data — don't let one landlord read or
  write another's listings, leads, or media.
- Use the same response envelope as everything else: `{ "data": [...],
  "meta": { "count": n } }` for lists, the bare resource for a single item,
  `{ "error": { "code", "message" } }` for errors.
- Prefer merging into an existing REST verb over adding a new bespoke
  action-path — e.g. a new toggle probably belongs as another field on the
  `PATCH /listings/:id` body, not a new `POST /listings/:id/do-the-thing`
  endpoint. This keeps the surface small and REST-shaped rather than
  growing back into the source system's one-endpoint-per-action pattern.
- Add the route to `openapi.yaml` with an `x-provenance: added` tag and the
  same short reasoning in the `description`.
- Seed any stub data it needs in `src/data/`, following the existing
  fictional-data conventions (see `docs/OWNERSHIP.md` §1 — no real names,
  emails, or addresses) and field-naming conventions (see
  `docs/SECURITY_NOTE.md` — no reusing a distinctive real field name).

## 3. Keep it a mock, and keep it separate

Don't wire up real third-party services (real payment processors, real
identity providers, real cloud storage) inside this sandbox. Fake the
response shape the way `media/upload-url` does. Your actual mobile app is
free to integrate real services — this repo just isn't the place for real
credentials or live integrations. And never point anything built against
this API — mock or real — at a live Student.com hostname; this sandbox is
locally-hosted only.

## 4. Everything else is fair game

Change the seed data, add more properties or users, swap the framework the
mock server is written in, throw the whole mock away and write your own
against `openapi.yaml` as the contract — whatever gets you to a working app
fastest. Just keep the reasoning trail for any *new* endpoint you introduce,
since that's part of what's being evaluated.
