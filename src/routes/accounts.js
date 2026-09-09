// src/routes/accounts.js
//
// Renamed and restructured from the source API's `auth` endpoints —
// resource name, paths, and error/response shapes are all different from
// the source; see docs/SECURITY_NOTE.md.
//
// - POST /accounts/signup  -> loosely based on the source's register
//   endpoint (field names simplified).
// - POST /accounts/session -> ADDED. The source system issues tokens via a
//   third-party identity provider before a request ever reaches its API;
//   a standalone mock needs *some* way to hand one out, so this exists
//   purely to make the sandbox runnable end-to-end.
// - GET  /accounts/me      -> loosely based on the source's profile
//   endpoint.

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { requireAuth, err } = require("../middleware/auth");

router.post("/accounts/signup", (req, res) => {
  const { email, first_name, last_name, phone, company_name } = req.body || {};

  if (!email || !first_name) {
    return err(res, 422, "validation_error", "email and first_name are required.");
  }

  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    return res.status(200).json({
      id: existing.id,
      email: existing.email,
      first_name: existing.first_name,
      last_name: existing.last_name,
    });
  }

  const user = {
    id: `usr_${uuidv4().slice(0, 8)}`,
    email,
    first_name,
    last_name: last_name || null,
    phone: phone || null,
    company_name: company_name || null,
    marketing_consent: false,
    created_at: new Date().toISOString(),
  };
  db.users.push(user);

  res.status(201).json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});

router.post("/accounts/session", (req, res) => {
  const { email } = req.body || {};
  const user = db.users.find((u) => u.email === email);

  if (!user) {
    return err(res, 401, "unauthorized", "No account found for that email in the sandbox seed data.");
  }

  // Not a real token. See middleware/auth.js.
  res.json({
    access_token: `sandbox-session.${user.id}`,
    token_type: "bearer",
    user,
  });
});

router.get("/accounts/me", requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
