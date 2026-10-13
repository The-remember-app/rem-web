/**
 * Безопасно преобразует значение типа `unknown` в валидную строку или `null`.
 * Корректно обрабатывает `null`, `undefined`, `unknown`, пустые строки,
 * а также строковые литералы "null" и "undefined".
 */
export function toNullableString(value?: string | null | unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    // Если значение пришло не строкой (например, объект или массив из-за кривого JSON)
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();

    if (
        trimmed === '' ||
        trimmed.toLowerCase() === 'null' ||
        trimmed.toLowerCase() === 'undefined'
    ) {
        return null;
    }

    return trimmed;
}


