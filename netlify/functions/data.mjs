// netlify/functions/data.mjs
//
// Cloud storage for the Road to Mil dashboard.
// GET  /api/data  -> returns the saved tracker state (or null if nothing saved yet)
// POST /api/data  -> saves the tracker state sent as the JSON body
//
// Storage is Netlify Blobs. `getStore()` picks up the site + deploy context
// automatically when this function runs on Netlify (and under `netlify dev`
// locally) — no manual credentials needed.
//
// Optional protection: if the RTM_SECRET environment variable is set on the
// site (Site configuration -> Environment variables), every request must
// include a matching `x-rtm-secret` header, or it's rejected with 401.
// Leave RTM_SECRET unset if you don't want a passcode.

import { getStore } from "@netlify/blobs";

const STORE_NAME = "road-to-mil";
const KEY = "tracker";

function checkSecret(req) {
  const required = process.env.RTM_SECRET;
  if (!required) return true;
  const provided = req.headers.get("x-rtm-secret") || "";
  return provided === required;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async (req) => {
  if (!checkSecret(req)) {
    return json({ error: "unauthorized" }, 401);
  }

  const store = getStore(STORE_NAME);

  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json" });
    return json(data || null);
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return json({ error: "invalid JSON body" }, 400);
    }
    body.updatedAt = new Date().toISOString();
    await store.setJSON(KEY, body);
    return json({ ok: true, updatedAt: body.updatedAt });
  }

  return json({ error: "method not allowed" }, 405);
};

export const config = {
  path: "/api/data",
};
