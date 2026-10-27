// src/routes/system.ts
//
// Service status and health endpoints, plus a placeholder task-polling
// endpoint for async-job patterns.

import { Router } from "express";
import db from "../db";
import { err } from "../middleware/auth";

const router = Router();

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

export default router;
