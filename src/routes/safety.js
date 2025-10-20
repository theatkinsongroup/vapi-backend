import express from "express";
import { addToBlocklist } from "../utils/blocklist.js";

/**
 * Body: { fromNumber: "+1602...", category: "threat|sexual|abuse", transcript?: "..." }
 */
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fromNumber, category } = req.body || {};
    if (fromNumber) addToBlocklist(fromNumber);
    // TODO: Optionally forward details to Slack/Email for admin review
    return res.json({ ok: true, blocked: !!fromNumber, category });
  } catch (e) {
    console.error("SAFETY_ERROR", e);
    return res.status(500).json({ ok: false, error: "SAFETY_ERROR" });
  }
});

export default router;
