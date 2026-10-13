/**
 * Безопасно приводит Date или string к ISO-строке
 */
export function toIsoString(date?: Date | string): string | undefined {
    if (!date) return undefined;
    return date instanceof Date ? date.toISOString() : date;
}