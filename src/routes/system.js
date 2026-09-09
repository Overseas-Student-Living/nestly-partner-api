// src/routes/system.js
//
// Loosely inspired by the source API's system endpoints, but the response
// shapes here are deliberately NOT a copy of the source's `ServiceInfoResponse`
// / `HealthResponse` schemas — see docs/SECURITY_NOTE.md for why that
// matters. Path names, field names, and the JSON envelope have all been
// changed rather than reused.

const express = require("express");
const router = express.Router();
const db = require("../db");
const { err } = require("../middleware/auth");

router.get("/status", (req, res) => {
  res.json({
    api: "nestly-competition-sandbox",
    state: "ready",
  });
});

router.get("/status/health", (req, res) => {
  res.json({
    state: "ok",
    dependencies: {
      accounts: "ok",
      listings: "ok",
      leads: "ok",
      media: "ok",
    },
  });
});

// Vestigial in this mock — nothing currently enqueues a task, so this will
// always 404 unless you build something that populates db.tasks. Kept as a
// placeholder in case your app needs an async-job pattern (e.g. bulk photo
// processing) and you want a polling endpoint to build against.
router.get("/tasks/:task_id", (req, res) => {
  const task = db.tasks[req.params.task_id];
  if (!task) return err(res, 404, "not_found", "Task not found.");
  res.json(task);
});

module.exports = router;
