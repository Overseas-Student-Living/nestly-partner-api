# How to submit your entry

This guide explains what to hand in for the Nestly landlord app competition.
Read it alongside [`README.md`](README.md), [`CONTRIBUTING.md`](CONTRIBUTING.md),
and [`docs/OWNERSHIP.md`](docs/OWNERSHIP.md). Submitting an entry means you
accept the ownership terms in `docs/OWNERSHIP.md`.

## 1. Before you start

- Run the mock API locally: `npm install`, then `npm start`. It listens on
  `http://localhost:4000`.
- Only point your app at `localhost` or your machine's LAN IP. Never point it at
  a Student.com hostname (see `docs/SECURITY_NOTE.md`).

## 2. Build your app

Build a landlord mobile app that covers the brief in `README.md` §1: sign up
and log in, portfolio overview, create and edit listings, publish and
unpublish, leads, and per-listing performance.

If you need an endpoint the mock doesn't provide, add it following
`CONTRIBUTING.md`. Every new endpoint needs a written reason, a
`x-participant-added: true` tag in `openapi.yaml`, and `npm run typecheck` passing.

Before submitting, check that your app:

- handles errors, empty states, and permission boundaries (for example a `403`
  when fetching a listing you don't own);
- includes some tests;
- works from a fresh clone with the setup steps in your own README.

## 3. Prepare your submission

Your submission is a repository (your own or a fork of this one) that contains:

1. **Your app source code.**
2. **A README** with setup and run instructions, and how to run your tests.
3. **Submission notes** (`SUBMISSION_NOTES.md` or a section in the README) covering:
   - what you built and which brief items it covers;
   - each new endpoint, with the reasoning from `CONTRIBUTING.md`;
   - what you would build next with two more sprints;
   - any third-party tools, libraries, or AI assistants you used, with credit.
4. **Confirmation** that the work is your own (or your team's), or that you have
   the right to submit it, as set out in `docs/OWNERSHIP.md`.

## 4. Send it in

1. **Fork this repository** on GitHub into your own account.
2. **Build your entry in your fork** and push it there, with your submission
   notes and setup instructions.
3. **Add the organizers as collaborators on your fork, with read access.**
   This is required. In your fork, go to **Settings → Collaborators** and
   add each of these GitHub accounts:
   - `genepeng`
   - `jacksonPJ95`
   - `kylem123`
   - `ravi-nar`
4. **Send the link to your fork** to the organizers by the deadline.

- **Deadline:** _to be confirmed by the organizers._

Competition logistics such as deadlines, the judging panel, and prizes are not
covered in this repository. Ask the organizers if anything here is unclear
before you submit.
