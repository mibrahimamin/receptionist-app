import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";

/** Verifies a plaintext passcode against a stored "salt:hash" string. */
export function verifyPasscode(passcode: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const attempt = scryptSync(passcode, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (attempt.length !== expected.length) return false;
  return timingSafeEqual(attempt, expected);
}
