# Ownership, IP & Participation Terms

These terms apply to the **Nestly Landlord App competition**, run by
**Student.com**. Read this before you start building.

## 1. What's in this repository

Everything in this repository — the mock API, the seed/stub data, the
OpenAPI spec, the docs — is a **sanitized, fictional recreation** built for
this competition. It is *loosely inspired by* patterns in a real
Student.com production system, but:

- All company names, contact details, emails, phone numbers, addresses,
  coordinates, prices, ratings, and reviews in `src/data/*.json` are
  **invented**. None of it refers to a real landlord, tenant, property, or
  user.
- Real third-party vendor names (identity providers, CRM, cloud storage,
  etc.) have been replaced with generic placeholders (e.g. "identity
  service", "media storage").
- Internal admin/ops-only endpoints from the original system (bulk data
  scraping, content-enrichment pipelines, moderation tooling, etc.) have
  been deliberately excluded — they aren't relevant to building a landlord
  app and some describe internal infrastructure that isn't ours to publish.
- The API itself — paths, HTTP verbs, field names, response shape, error
  format — has been **restructured**, not just relabeled, specifically so
  this repo can't function as a map of a live system's surface. See
  [`SECURITY_NOTE.md`](SECURITY_NOTE.md) for exactly what changed and why,
  and the one rule that follows from it: never point anything built
  against this mock at a real Student.com host.

Nothing here should be treated as real user data, and nothing you learn
from this repo should be assumed to describe how Student.com's production
systems are actually built, secured, or hosted today.

## 2. Ownership of submissions

By taking part in this competition and submitting an entry:

- **Any work you submit — code, designs, written documentation, and any
  other deliverable produced for this competition — becomes the property
  of Student.com.** This includes the right for Student.com to use, modify,
  host, and build upon your submission, including beyond the competition
  itself.
- You confirm that the work you submit is your own (or your team's), or
  that you have the right to submit it (for example, permissively licensed
  open-source components you're allowed to build on — credit your sources).
- You keep the right to talk about and showcase your own participation
  (e.g. in a portfolio), but the submitted deliverable itself belongs to
  Student.com as above.

If anything here is unclear, ask the organizers before you submit — don't
guess.

## 3. Freedom of approach

**Participants are free to use whatever tools, frameworks, languages,
libraries, AI coding assistants, or methods they find useful** in building
their entry. There's no required tech stack for the landlord app itself.
The only fixed points are:

- The mock API in this repo (or your own extension of it, per
  `CONTRIBUTING.md`) is the data layer you build against.
- Your entry should be a genuine attempt at a **production-ready mobile
  app** — see `README.md` for what "production-ready" means for the
  purposes of judging.

## 4. Adding new endpoints

The mock API is deliberately not exhaustive. If your app idea needs
something it doesn't provide, you're encouraged to add it yourself — see
`CONTRIBUTING.md` for the required format (every new endpoint needs a short
written reason, not just code).

## 5. Questions

Route competition-logistics questions (deadlines, judging panel, prizes) to
the organizers through whatever channel you were given this repo in — none
of that logistical detail is tracked in this document.
