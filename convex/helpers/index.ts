/**
 * Recursively converts all bigint values in an object to strings
 * @param value - Any value (object, array, primitive, etc.)
 * @returns The same structure with all bigint values converted to strings
 */
export function convertBigIntToString<T>(
  value: T
): T extends bigint
  ? string
  : T extends (infer U)[]
    ? U extends bigint
      ? string[]
      : ReturnType<typeof convertBigIntToString<U>>[]
    : T extends Record<string, unknown>
      ? { [K in keyof T]: ReturnType<typeof convertBigIntToString<T[K]>> }
      : T {
  if (typeof value === "bigint") {
    return value.toString() as any;
  }

  if (Array.isArray(value)) {
    return value.map(convertBigIntToString) as any;
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = convertBigIntToString(val);
    }
    return result as any;
  }

  return value as any;
}
