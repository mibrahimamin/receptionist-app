// Uses the Web Crypto API (globalThis.crypto.subtle) rather than node:crypto
// so this file can run in both the Edge middleware and normal Node routes.

export const SESSION_COOKIE_NAME = "receptionist_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

async function hmacKey() {
  const raw = new TextEncoder().encode(getSecret());
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string) {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(sig);
}

/** Builds a signed cookie value: businessId.expiry.signature */
export async function createSessionCookieValue(businessId: string) {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${businessId}.${expiry}`;
  return `${payload}.${await sign(payload)}`;
}

/** Validates a session cookie value and returns the businessId if valid. */
export async function verifySessionCookieValue(value: string | undefined | null) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [businessId, expiryStr, signature] = parts;
  const payload = `${businessId}.${expiryStr}`;
  const expected = await sign(payload);

  if (expected.length !== signature.length) return null;
  // constant-time-ish comparison
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (diff !== 0) return null;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return null;
  return businessId;
}
