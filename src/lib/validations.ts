/**
 * Validation helpers (used by Zod schemas and tests).
 */

export function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}
