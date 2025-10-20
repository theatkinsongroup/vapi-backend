import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { google } from "googleapis";

dayjs.extend(utc);
dayjs.extend(timezone);

const PHX_TZ = "America/Phoenix";
const DURATION_MIN = 15;
const BUFFER_MIN = 15;

export function getCalendar() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON");
  const creds = typeof raw === "string" ? JSON.parse(raw) : raw;

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });

  return google.calendar({ version: "v3", auth });
}

export function validateSlot(startISO) {
  const start = dayjs.tz(startISO, PHX_TZ).second(0).millisecond(0);
  const now = dayjs().tz(PHX_TZ);

  if (!start.isValid()) return { ok: false, reason: "INVALID_START" };
  if (!start.isAfter(now)) return { ok: false, reason: "PAST_TIME" };

  const year = start.year();
  if (year < 2024 || year === 2023) return { ok: false, reason: "YEAR_BLOCKED" };

  const day = start.day(); // 0=Sun ... 6=Sat
  if (day === 0) return { ok: false, reason: "SUNDAY_BLOCKOUT" };

  const hour = start.hour();
  const minute = start.minute();
  const hm = hour * 100 + minute;
  if (hm < 900 || hm > 1800) return { ok: false, reason: "OUTSIDE_BUSINESS_HOURS" };

  // Wednesday blackout 09:00–12:00
  if (day === 3 && hm >= 900 && hm < 1200) return { ok: false, reason: "WED_MORNING_BLOCKOUT" };

  // Passed static checks
  const end = start.add(DURATION_MIN, "minute");
  const windowStart = start.subtract(BUFFER_MIN, "minute");
  const windowEnd = end.add(BUFFER_MIN, "minute");

  return { ok: true, start, end, windowStart, windowEnd };
}

export async function checkDailyLimit(calendar, calendarId, start) {
  const dayStart = start.startOf("day");
  const dayEnd = start.endOf("day");
  const resp = await calendar.events.list({
    calendarId,
    timeMin: dayStart.toISOString(),
    timeMax: dayEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime"
  });
  const count = (resp.data.items ?? []).length;
  if (count >= 6) return { ok: false, reason: "DAILY_LIMIT" };
  return { ok: true };
}

export async function checkConflict(calendar, calendarId, windowStart, windowEnd) {
  const resp = await calendar.events.list({
    calendarId,
    timeMin: windowStart.toISOString(),
    timeMax: windowEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime"
  });
  const conflicting = (resp.data.items ?? []).some(ev => {
    const evStartRaw = ev.start?.dateTime ?? ev.start?.date;
    const evEndRaw = ev.end?.dateTime ?? ev.end?.date;
    const evStart = dayjs.tz(evStartRaw, PHX_TZ);
    const evEnd = dayjs.tz(evEndRaw, PHX_TZ);
    return evStart.isBefore(windowEnd) && evEnd.isAfter(windowStart);
  });
  return conflicting ? { ok: false, reason: "CONFLICTING_BUFFER" } : { ok: true };
}

export async function createEvent(calendar, calendarId, { start, end, candidateName, phone, email, notes }) {
  const descriptionLines = [
    `Candidate: ${candidateName || "Unknown"}`,
    `Phone: ${phone || "Unknown"}`,
    email ? `Email: ${email}` : null,
    notes ? `Notes: ${notes}` : null,
    `Booked by: david (Vapi)`
  ].filter(Boolean);

  const result = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: "Intro Call with Jim Atkinson (15 min)",
      description: descriptionLines.join("\n"),
      start: { dateTime: start.toISOString(), timeZone: PHX_TZ },
      end:   { dateTime: end.toISOString(),   timeZone: PHX_TZ },
      attendees: [
        { email: "jim@aghomes.com" },
        ...(email ? [{ email }] : [])
      ]
    }
  });

  return result.data;
}
