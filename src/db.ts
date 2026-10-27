// src/db.ts
//
// Extremely simple in-memory "database" seeded from the JSON fixtures in
// src/data/. Data resets every time the server restarts — that's
// intentional for a competition sandbox: every participant starts from the
// same known state.
//
// Importing the fixtures (rather than reading them off disk) means the
// compiler checks them against the types in ./types, and `tsc` copies them
// into dist/ alongside the compiled server.

import type { Lead, Listing, Review, Task, User } from "./types";
import usersSeed from "./data/users.json";
import listingsSeed from "./data/listings.json";
import leadsSeed from "./data/leads.json";
import reviewsSeed from "./data/reviews.json";

interface State {
  users: User[];
  listings: Listing[];
  leads: Lead[];
  reviews: Review[];
  tasks: Record<string, Task>; // populated at runtime by long-running mock actions
}

const state: State = {
  users: usersSeed,
  listings: listingsSeed as Listing[],
  leads: leadsSeed as Lead[],
  reviews: reviewsSeed,
  tasks: {},
};

export default state;
