import { BaseApiError, UnauthorizedError, OutdatedDataError, ValidationError } from './errors/api-error';

export interface ApiEnvelope<T> {
    data?: T | null;
    errors?: Array<any> | null;
    info?: {
        api_version?: string;
        deprecated?: boolean;
    };
}

export class ApiResponseHandler {
    /**
     * Валидирует и извлекает `data` из обертки API.
     * Принимает ответов любых типов, сгенерированных OpenAPI/HeyAPI SDK.
     */
    public handle<T>(response: { data?: any; error?: any; response?: Response }): T {
        // 1. Обработка системных / сетевых ошибок HTTP
        if (response?.error) {
            const status = response.response?.status;
            const errorPayload = response.error;

            if (status === 401) throw new UnauthorizedError('Unauthorized access', [errorPayload]);
            if (status === 409) throw new OutdatedDataError('Data conflict / Outdated', [errorPayload]);
            if (status === 422) throw new ValidationError('Validation error', [errorPayload]);

            throw new BaseApiError(
                errorPayload?.message || 'Network request failed',
                status,
                [errorPayload]
            );
        }

        const body = response?.data;

        // 2. Обработка ошибок внутри JSON-обертки Ans[...]
        if (body && Array.isArray(body.errors) && body.errors.length > 0) {
            const firstErr = body.errors[0];
            const message = typeof firstErr === 'string'
                ? firstErr
                : firstErr?.message || JSON.stringify(firstErr);

            if (firstErr?.error_type === 'not_authenticated') {
                throw new UnauthorizedError(message, body.errors);
            }
            if (firstErr?.error_type === 'validation') {
                throw new ValidationError(message, body.errors);
            }

            throw new BaseApiError(message || 'API Server Error', undefined, body.errors);
        }

        // 3. Возврат результата из поля data или тела целиком
        if (body && typeof body === 'object' && 'data' in body) {
            return body.data as T;
        }

        return body as T;
    }
}