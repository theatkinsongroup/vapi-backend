import express from "express";
import { sendSMS } from "../utils/twilio.js";

const router = express.Router();

/**
 * Body: { to: "+1...", whenPHX?: "Tue 3:15 PM", confirmed?: true, custom?: "..." }
 */
router.post("/", async (req, res) => {
  try {
    const { to, whenPHX, confirmed, custom } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, error: "Missing 'to'" });

    const body =
      custom ||
      (confirmed
        ? `Confirmed: 10–15 min call with Jim Atkinson on ${whenPHX}. Reply STOP to opt out.`
        : `Reminder: your call with Jim Atkinson is today at ${whenPHX}.`);

    await sendSMS({ to, body });
    return res.json({ ok: true });
  } catch (e) {
    console.error("SMS_ERROR", e);
    return res.status(500).json({ ok: false, error: "SMS_ERROR" });
  }
});

export default router;
