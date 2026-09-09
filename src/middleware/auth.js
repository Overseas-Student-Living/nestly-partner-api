// src/middleware/auth.js
//
// Stub auth for the competition sandbox only. Tokens are NOT real JWTs and
// this scheme is unique to this sandbox — it is not modeled on, and does
// not resemble, any real Student.com auth token format. Tokens look like
// `sandbox-session.<user_id>` and are issued by POST /accounts/session.
// Do not model production auth on this; see README "Auth" section for
// what a production build needs instead (OAuth2 / rotating tokens / etc).

const db = require("../db");

function err(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function requireAuth(req, res, next) {
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

module.exports = { requireAuth, err };
