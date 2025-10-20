import nodemailer from "nodemailer";

export function getTransport() {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("Missing SMTP_USER/SMTP_PASS");
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { ciphers: "TLSv1.2" }
  });
}

export function buildICS({ startISO, endISO, summary, description }) {
  // ICS expects UTC datetime in YYYYMMDDTHHMMSSZ
  const fmt = (iso) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Atkinson Group//Recruiting//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(startISO)}`,
    `DTEND:${fmt(endISO)}`,
    `SUMMARY:${summary || "Intro Call with Jim Atkinson (15 min)"}`,
    `DESCRIPTION:${(description || "").replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.join("\r\n");
}

export async function sendEmailWithICS({ to, subject, text, startISO, endISO, description }) {
  const transporter = getTransport();
  const ics = buildICS({ startISO, endISO, summary: subject, description });
  await transporter.sendMail({
    from: `"Jim Atkinson" <${process.env.SMTP_USER}>`,
    to,
    subject: subject || "Confirmed: 10–15 min call with Jim Atkinson",
    text: text || "Your appointment is confirmed. You’ll also receive a text reminder.",
    alternatives: [
      { contentType: "text/calendar; method=PUBLISH", content: ics }
    ]
  });
  return { ok: true };
}
