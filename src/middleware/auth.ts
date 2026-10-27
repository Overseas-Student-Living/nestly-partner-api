// src/middleware/auth.ts
//
// Stub auth for the competition sandbox only. Tokens are NOT real JWTs and
// the format is unique to this sandbox. Tokens look like
// `sandbox-session.<user_id>` and are issued by POST /accounts/session.
// Do not model production auth on this; see README "Auth" section for
// what a production build needs instead (OAuth2 / rotating tokens / etc).

import type { NextFunction, Request, Response } from "express";
import db from "../db";

export function err(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ error: { code, message } });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return err(res, 401, "unauthorized", "Missing or malformed Authorization header. Expected: Bearer <token>");
  }

  const [prefix, userId] = token.split(".");
  if (prefix !== "sandbox-session" || !userId) {
    return err(res, 401, "unauthorized", "Invalid token.");
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return err(res, 401, "unauthorized", "Token does not match any known user.");
  }

  req.user = user;
  next();
}
