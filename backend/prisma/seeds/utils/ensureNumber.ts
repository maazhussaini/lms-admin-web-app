// Utility to ensure a value is a number, throws if not
export function ensureNumber(value: any, errorMessage?: string): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  throw new Error(errorMessage || `Value is not a valid number: ${value}`);
}
