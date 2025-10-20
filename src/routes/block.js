import express from "express";
import { addToBlocklist, isBlocked, getAllBlocked } from "../utils/blocklist.js";

/**
 * POST /api/block  Body: { number: "+1..." }
 * GET  /api/block  -> { blocked: ["+1..."] }
 * GET  /api/block/is-blocked?number=+1...
 */
const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { number } = req.body || {};
    if (!number) return res.status(400).json({ ok: false, error: "Missing number" });
    const n = addToBlocklist(number);
    return res.json({ ok: true, number: n });
  } catch (e) {
    console.error("BLOCK_ADD_ERROR", e);
    return res.status(500).json({ ok: false, error: "BLOCK_ADD_ERROR" });
  }
});

router.get("/", (_req, res) => {
  return res.json({ ok: true, blocked: getAllBlocked() });
});

router.get("/is-blocked", (req, res) => {
  const { number } = req.query;
  return res.json({ ok: true, blocked: isBlocked(number) });
});

export default router;
