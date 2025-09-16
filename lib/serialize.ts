// lib/serialize.ts
export type JsonLike = unknown;

export function toJsonString(value: JsonLike): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}