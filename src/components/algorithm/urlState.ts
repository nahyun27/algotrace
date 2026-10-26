/**
 * Pure helpers for syncing page state to the query string (no React; unit-tested in urlState.test.ts).
 * Only built-in variants / examples / the step index go in the URL, never user-built graphs or arrays.
 */

/** Clamp a step index to `[0, total - 1]` (0 for an empty list). */
export function clampStep(i: number, total: number): number {
  return Math.max(0, Math.min(i, Math.max(0, total - 1)));
}

/** Parse a raw `?step=` value into a non-negative integer (0 when missing/invalid). Clamp to the step count separately. */
export function parseStepParam(raw: string | null | undefined): number {
  if (raw == null || raw.trim() === '') return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

/** Parse `?step=` into a valid step index for a list of `total` steps. */
export function parseStep(raw: string | null | undefined, total: number): number {
  return clampStep(parseStepParam(raw), total);
}

/** The `?step=` value to write for a step index (`null` = omit, for the first step). */
export function encodeStep(index: number): string | null {
  return index > 0 ? String(index) : null;
}

/** Match a query value against the allowed values (case-insensitive); fall back when unknown. */
export function parseEnum<T extends string>(raw: string | null | undefined, allowed: readonly T[], fallback: T): T {
  if (raw == null) return fallback;
  const lower = raw.toLowerCase();
  return allowed.find(v => v.toLowerCase() === lower) ?? fallback;
}

/** How a value is written to the URL (lower-case keeps links readable: `?mode=dfs`). */
export function encodeEnum(value: string): string {
  return value.toLowerCase();
}

/**
 * Apply a patch to a query string: `null` deletes the key, a string sets it.
 * Returns the new search string without the leading `?` (empty when nothing is left).
 */
export function patchSearch(search: string, patch: Record<string, string | null>): string {
  const params = new URLSearchParams(search);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  return params.toString();
}
