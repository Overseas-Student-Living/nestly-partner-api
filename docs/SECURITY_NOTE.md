# Security rules for this sandbox

This repo is a self-contained, fictional mock API built for the
competition. It is the only backend you need, and it is designed on its
own terms — nothing in it documents, or should be read as describing, any
Student.com production system.

## The rules

- **Run it locally only.** Point your app at `localhost` (or your own
  self-hosted copy of this mock) and nowhere else. Never point a client
  built against this API at any Student.com hostname, and never deploy
  this mock to a production-like domain.
- **Don't probe real systems.** Using this repo, or anything you build
  with it, to send requests to Student.com infrastructure is out of scope
  for the competition and not permitted.
- **Extend it using its own conventions.** When you add endpoints, follow
  the patterns already in this repo (see `CONTRIBUTING.md`) — paths, the
  `{ "data", "meta" }` list envelope, the `{ "error": { "code",
  "message" } }` error shape, and the sandbox token. Don't try to make the
  mock "more realistic" by guessing at how any real service works; realism
  in the judged app is about UX, error handling, and a believable auth
  model, not the wire format.
- **Keep secrets and real data out.** No real credentials, API keys,
  personal data, or live third-party integrations in this repo or in your
  fork of it. Fake responses the way `media/upload-url` does.
- **Report anything that looks real.** If you find something in this repo,
  or in anything shared as part of the competition, that looks like a real
  hostname, internal service name, credential, or personal data, stop and
  report it to the organizers privately. Don't use it, test it, or post it
  publicly (including in issues or PRs on this repo).

## The sandbox token is not a security model

`sandbox-session.<user_id>` exists only so the mock can tell landlords
apart. It has no secret, no signature, and no expiry — anyone can forge
one. Treat it as a placeholder: your app should store and handle it the
way it would a real access token, and your submission should explain what
a real token lifecycle would look like (see README §3).
