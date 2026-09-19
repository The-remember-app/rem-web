// helpers.ts
export function toIsoString(date?: Date | string | null): string {
    if (!date) return new Date().toISOString();
    return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
}

export function toDate(dateStr?: string | Date | null): Date {
    if (!dateStr) return new Date();
    return dateStr instanceof Date ? dateStr : new Date(dateStr);
}