// Minimal Express server to keep nodemon alive and provide a health check.
// This is intentionally lightweight scaffolding for local dev.

const express = require("express");
const dotenv = require("dotenv");

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (_req, res) => {
  res
    .status(200)
    .send("Backend is running. Try GET /health for a JSON response.");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
