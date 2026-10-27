# Nestly Landlord App — Competition Starter Kit

Welcome! This repo is the starting point for a competition run by
**Student.com**: build a **production-ready landlord mobile app** — a
companion app that lets property owners and letting agents manage their
student-accommodation listings, talk to prospective tenants, and see how
their portfolio is performing.

You are **not** working against any Student.com system. This repo
contains a small, self-hosted **mock API** designed around the landlord
use case, plus fictional stub data, so you can build and test a real app
end-to-end without needing any credentials or access to anything real.

**Two docs to read before you start:**
- [`docs/OWNERSHIP.md`](docs/OWNERSHIP.md) — what's real vs. fictional
  here, and who owns what you submit.
- [`docs/SECURITY_NOTE.md`](docs/SECURITY_NOTE.md) — the security rules
  for the sandbox, starting with the hard one: **never point a client
  built against this mock at any real Student.com hostname.**

---

## 1. The brief

Landlords currently have no self-serve way to manage how their properties
appear to students searching for accommodation, or to see and respond to
enquiries. Your job is to design and build a mobile app that lets a
landlord:

- **Sign up and log in.**
- **See their portfolio** — every property they own, at a glance.
- **Create and edit a listing** — address, price, description, amenities,
  photos, floorplans.
- **Publish or unpublish a listing**, and control whether their direct
  contact details are visible to the public.
- **See and act on leads** from prospective tenants, per listing and
  across their whole portfolio.
- **See basic performance data** per listing (lead volume, reviews,
  rating, photo coverage) so they know where to focus.

That's the floor, not the ceiling. If your app idea needs something the
mock API doesn't provide, add it — see [`CONTRIBUTING.md`](CONTRIBUTING.md).

### What "production-ready" means here

You won't have time to build everything a real launch needs, and that's
fine — judging isn't "did you build every feature," it's "if this had two
more sprints, would it obviously get there." Concretely, we're looking for:

- **Real error handling** — network failures, validation errors, empty
  states, not just the happy path.
- **A believable data/auth model** — even against a mock backend, show you
  understand what a real token lifecycle, session expiry, and permission
  model would look like (the mock's fake bearer token is a placeholder —
  see §3, don't copy its shape into a real app).
- **Usable, coherent UI** — doesn't need to be beautiful, needs to make
  sense to a landlord who is not a developer.
- **Some form of testing** — even a handful of meaningful tests beats none.
- **Clear documentation of what you built and why**, especially any new
  endpoints (§5).

---

## 2. Quickstart

Requires Node.js 18+.

```bash
npm install
npm start          # compiles TypeScript to dist/, then runs it
# Nestly Partner API (mock) listening on http://localhost:4000
```

While iterating on the mock itself, `npm run dev` runs `src/server.ts`
directly with auto-reload, and `npm run typecheck` type-checks without
emitting.

Data resets to the fixtures in `src/data/` every time you restart the
server — that's intentional, so everyone starts from the same known state
while iterating.

Try it:

```bash
# Log in as a seeded landlord (see src/data/users.json for the full list)
curl -X POST http://localhost:4000/accounts/session \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.landlord@example.com"}'
# -> { "access_token": "sandbox-session.usr_8f3a1c2d", ... }

curl http://localhost:4000/listings/mine \
  -H "Authorization: Bearer sandbox-session.usr_8f3a1c2d"
```

Point your app at `http://localhost:4000` (use your machine's LAN IP
instead of `localhost` if you're testing on a physical device/emulator that
can't reach your dev machine's loopback address). **Do not point it at any
other host** — see `docs/SECURITY_NOTE.md`.

The full contract is in [`openapi.yaml`](openapi.yaml) — import it into
Postman, Insomnia, or any OpenAPI-aware tool if you'd rather explore that
way.

---

## 3. Auth (read this — it's intentionally fake)

`POST /accounts/session` takes an `email` from the seed data and hands back
a token shaped like `sandbox-session.<user_id>`. There is no password
check, no expiry, no refresh flow, and this token format is unique to this
sandbox — it doesn't resemble any real auth scheme.

**Do not model your app's real auth on this.** Build your UI/UX as if a
real system were behind it (login errors, session expiry, secure token
storage) — just know the mock won't actually enforce most of that. If
you want the mock to *behave* more realistically (expiring tokens, refresh
tokens, wrong-password errors), that's a great candidate for an endpoint
you add yourself, with your reasoning documented per §5.

---

## 4. Endpoint reference

| Method | Path | What it does |
|---|---|---|
| GET | `/status` | Service status |
| GET | `/status/health` | Dependency health check |
| GET | `/tasks/:task_id` | Poll a background task (placeholder) |
| POST | `/accounts/signup` | Create a landlord account |
| POST | `/accounts/session` | Exchange an email for a sandbox bearer token |
| GET | `/accounts/me` | Current landlord's profile |
| GET | `/listings/mine` | List the caller's own listings |
| POST | `/listings` | Create a new listing (starts as `draft`) |
| GET | `/listings/:id` | Fetch one listing you own |
| PATCH | `/listings/:id` | Update fields, publish state, and/or contact visibility in one call |
| PUT | `/listings/:id/amenities` | Replace the amenities list |
| POST | `/listings/:id/media/upload-url` | Get a (fake) upload URL |
| POST | `/listings/:id/media` | Register an uploaded media item |
| DELETE | `/listings/:id/media/:media_id` | Remove a media item |
| GET | `/listings/:id/reviews` | Reviews for one listing |
| GET | `/listings/:id/insights` | Per-listing performance summary |
| GET | `/leads` | Leads across everything you own, optional `?listing_id=` filter |
| GET | `/overview` | Home-screen summary (portfolio, recent leads, action items) |

Full request/response shapes: [`openapi.yaml`](openapi.yaml).

---

## 5. Adding your own endpoints

Expected and encouraged. **Every new endpoint needs a short written
reason** — what it does, why the app needs it, why existing endpoints
can't cover it — and needs to follow the same conventions as the rest of
this API. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the exact format. Endpoints
submitted without reasoning will be judged as if they weren't there.

---

## 6. Data model

Seed data lives in `src/data/*.json` and loads into an in-memory store on
boot (`src/db.ts`) — there's no real database. Three landlords, four
listings across two countries (mixed published/draft states, one with no
photos yet), a handful of leads in different states, and a few reviews.
Enough to exercise empty states, populated states, and permission
boundaries (try fetching a listing you don't own — you should get a
`403`).

---

## 7. Rules & ownership

Read [`docs/OWNERSHIP.md`](docs/OWNERSHIP.md) before you submit anything.
Short version: this repo's data is entirely fictional; you can use any
tools, languages, frameworks, or AI assistants you like to build your
entry; and whatever you submit becomes Student.com's property under the
terms in that document.

---

## 8. Project structure

```
.
├── openapi.yaml                # API contract
├── src/
│   ├── server.ts                 # Express app entrypoint
│   ├── db.ts                     # In-memory store, seeded from src/data/
│   ├── types.ts                  # Record types (User, Listing, Lead, Review, ...)
│   ├── data/                     # Fictional stub data (users, listings, leads, reviews)
│   ├── middleware/auth.ts        # Fake bearer-token auth
│   └── routes/                   # system, accounts, listings, leads, overview
├── docs/
│   ├── OWNERSHIP.md              # IP / participation terms
│   └── SECURITY_NOTE.md          # Security rules for the sandbox
├── tsconfig.json
└── CONTRIBUTING.md               # How to add new endpoints (with required reasoning)
```
