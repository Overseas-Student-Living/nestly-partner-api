# Adding endpoints to the mock API

This mock API covers a deliberately minimal landlord flow: signup/login,
manage your own listings, handle media and amenities, see leads, and an
overview summary. It will not cover everything your app idea needs — that's
expected. You're free to extend it.

**Read `docs/SECURITY_NOTE.md` first** — it's short, and it sets the
ground rules (local only, no real credentials or integrations, extend the
mock using its own conventions).

Every route in `src/routes/` has a short comment saying what it's for and
which landlord screen or flow needs it. If you add an endpoint, do the
same:

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
- Write it in TypeScript alongside the existing routes, add any new record
  shapes to `src/types.ts`, and make sure `npm run typecheck` passes.
- Reuse `requireOwnedListing` (or equivalent ownership checks) for anything
  scoped to a specific landlord's data — don't let one landlord read or
  write another's listings, leads, or media.
- Use the same response envelope as everything else: `{ "data": [...],
  "meta": { "count": n } }` for lists, the bare resource for a single item,
  `{ "error": { "code", "message" } }` for errors.
- Prefer merging into an existing REST verb over adding a new bespoke
  action-path — e.g. a new toggle probably belongs as another field on the
  `PATCH /listings/:id` body, not a new `POST /listings/:id/do-the-thing`
  endpoint. This keeps the surface small and REST-shaped.
- Add the route to `openapi.yaml` with an `x-participant-added: true` tag
  and the same short reasoning in the `description`, so judges can find
  what you added.
- Seed any stub data it needs in `src/data/`, following the existing
  fictional-data conventions (see `docs/OWNERSHIP.md` §1 — no real names,
  emails, or addresses) and the `snake_case` field naming used throughout.

## 3. Keep it a mock, and keep it separate

Don't wire up real third-party services (real payment processors, real
identity providers, real cloud storage) inside this sandbox. Fake the
response shape the way `media/upload-url` does. Your actual mobile app is
free to integrate real services — this repo just isn't the place for real
credentials or live integrations. And never point anything built against
this API at a live Student.com hostname; this sandbox is locally-hosted
only.

## 4. Everything else is fair game

Change the seed data, add more properties or users, swap the framework the
mock server is written in, throw the whole mock away and write your own
against `openapi.yaml` as the contract — whatever gets you to a working app
fastest. Just keep the reasoning trail for any *new* endpoint you introduce,
since that's part of what's being evaluated.
