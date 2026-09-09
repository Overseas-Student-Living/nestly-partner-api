// src/db.js
//
// Extremely simple in-memory "database" seeded from the JSON fixtures in
// src/data/. Data resets every time the server restarts — that's
// intentional for a competition sandbox: every participant starts from the
// same known state.

const fs = require("fs");
const path = require("path");

function load(file) {
  const p = path.join(__dirname, "data", file);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const state = {
  users: load("users.json"),
  listings: load("listings.json"),
  leads: load("leads.json"),
  reviews: load("reviews.json"),
  tasks: {}, // populated at runtime by long-running mock actions
};

module.exports = state;
