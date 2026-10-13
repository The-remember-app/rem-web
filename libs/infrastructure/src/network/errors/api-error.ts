export class BaseApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly rawErrors?: unknown[]
    ) {
        super(message);
        this.name = 'BaseApiError';
    }
}

export class UnauthorizedError extends BaseApiError {
    constructor(message = 'пользователь не авторизован', rawErrors?: unknown[]) {
        super(message, 401, rawErrors);
        this.name = 'UnauthorizedError';
    }
}

export class OutdatedDataError extends BaseApiError {
    constructor(message = 'передаваемые данные устарели', rawErrors?: unknown[]) {
        super(message, 409, rawErrors);
        this.name = 'OutdatedDataError';
    }
}

export class ValidationError extends BaseApiError {
    constructor(message = 'ошибка валидации данных', rawErrors?: unknown[]) {
        super(message, 422, rawErrors);
        this.name = 'ValidationError';
    }
}
