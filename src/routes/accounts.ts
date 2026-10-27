// src/routes/accounts.ts
//
// - POST /accounts/signup  -> create a landlord account.
// - POST /accounts/session -> exchange a seeded email for a sandbox bearer
//   token. Exists purely to make the sandbox runnable end-to-end without
//   a real identity provider; see middleware/auth.ts.
// - GET  /accounts/me      -> the authenticated landlord's profile.

import { randomUUID } from "node:crypto";
import { Router } from "express";
import db from "../db";
import { err, requireAuth } from "../middleware/auth";
import type { User } from "../types";

const router = Router();

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

  const user: User = {
    id: `usr_${randomUUID().slice(0, 8)}`,
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

  // Not a real token. See middleware/auth.ts.
  res.json({
    access_token: `sandbox-session.${user.id}`,
    token_type: "bearer",
    user,
  });
});

router.get("/accounts/me", requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;
