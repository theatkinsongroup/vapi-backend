// Simple in-memory blocklist. For persistence, replace with Redis or a DB.
const blocked = new Set();

export function normalizeNumber(n) {
  if (!n) return "";
  return ("" + n).replace(/[^\d+]/g, "");
}

export function addToBlocklist(number) {
  const n = normalizeNumber(number);
  if (n) blocked.add(n);
  return n;
}

export function isBlocked(number) {
  const n = normalizeNumber(number);
  return n ? blocked.has(n) : false;
}

export function getAllBlocked() {
  return Array.from(blocked);
}
