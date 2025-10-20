import express from "express";
import { sendEmailWithICS } from "../utils/email.js";

/**
 * Body: { to: "agent@email.com", startISO, endISO, subject?, description?, text? }
 */
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { to, startISO, endISO, subject, description, text } = req.body || {};
    if (!to || !startISO || !endISO) return res.status(400).json({ ok: false, error: "Missing to/startISO/endISO" });

    await sendEmailWithICS({ to, subject, text, startISO, endISO, description });
    return res.json({ ok: true });
  } catch (e) {
    console.error("EMAIL_ERROR", e);
    return res.status(500).json({ ok: false, error: "EMAIL_ERROR" });
  }
});

export default router;
