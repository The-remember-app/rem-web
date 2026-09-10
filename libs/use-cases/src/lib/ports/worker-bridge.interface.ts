export interface WorkerRequest<T = unknown> {
    correlationId: string;
    type: string;
    payload: T;
}

export interface WorkerResponse<T = unknown> {
    correlationId: string;
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface IWorkerBridge {
    /**
     * Отправляет команду в Worker-поток и ожидает ответа по correlationId
     */
    send<TResponse, TPayload = unknown>(
        type: string,
        payload: TPayload
    ): Promise<TResponse>;

    /**
     * Подписка на широковещательные события от Worker-а (например, прогресс синхронизации)
     */
    on<TEvents>(
        eventType: string,
        handler: (eventData: TEvents) => void
    ): () => void;
}