// Generates a salt:hash string for a dashboard passcode.
// Usage: node scripts/hash-passcode.mjs "your-passcode"
// Paste the printed value into businesses.passcode_hash in Supabase,
// or use it from the dashboard's first-run settings screen.
import { scryptSync, randomBytes } from "node:crypto";

const passcode = process.argv[2];
if (!passcode) {
  console.error('Usage: node scripts/hash-passcode.mjs "your-passcode"');
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(passcode, salt, 64).toString("hex");
console.log(`${salt}:${hash}`);
