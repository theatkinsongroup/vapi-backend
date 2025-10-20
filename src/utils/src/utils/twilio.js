import Twilio from "twilio";

export function getTwilioClient() {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  if (!sid || !token) throw new Error("Missing Twilio credentials");
  return Twilio(sid, token);
}

export async function sendSMS({ to, body }) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM;
  if (!from) throw new Error("Missing TWILIO_FROM");
  if (!to || !body) throw new Error("Missing to/body");
  await client.messages.create({ to, from, body });
  return { ok: true };
}
