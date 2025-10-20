import express from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { getCalendar, validateSlot, checkDailyLimit, checkConflict, createEvent } from "../utils/googleCalendar.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();
const PHX_TZ = "America/Phoenix";

router.post("/", async (req, res) => {
  try {
    const { candidateName, phone, email, requestedStartISO, notes } = req.body || {};
    if (!requestedStartISO) return res.status(400).json({ ok: false, error: "Missing requestedStartISO" });

    const calId = process.env.CALENDAR_ID;
    if (!calId) return res.status(500).json({ ok: false, error: "Missing CALENDAR_ID" });

    // Validate static rules
    const v = validateSlot(requestedStartISO);
    if (!v.ok) return res.json({ ok: false, reason: v.reason });

    const calendar = getCalendar();

    // Check daily cap
    const cap = await checkDailyLimit(calendar, calId, v.start);
    if (!cap.ok) return res.json({ ok: false, reason: cap.reason });

    // Check conflicts (with buffers)
    const conflict = await checkConflict(calendar, calId, v.windowStart, v.windowEnd);
    if (!conflict.ok) return res.json({ ok: false, reason: conflict.reason });

    // Create event
    const created = await createEvent(calendar, calId, {
      start: v.start,
      end: v.end,
      candidateName,
      phone,
      email,
      notes
    });

    // Response with PHX-friendly times
    const startPHX = dayjs(v.start).tz(PHX_TZ).format("YYYY-MM-DD HH:mm");
    const endPHX = dayjs(v.end).tz(PHX_TZ).format("YYYY-MM-DD HH:mm");

    return res.json({
      ok: true,
      eventId: created.id,
      startPHX,
      endPHX,
      startISO: v.start.toISOString(),
      endISO: v.end.toISOString()
    });
  } catch (e) {
    console.error("BOOK_ERROR", e);
    return res.status(500).json({ ok: false, error: "BOOKING_ERROR" });
  }
});

export default router;
