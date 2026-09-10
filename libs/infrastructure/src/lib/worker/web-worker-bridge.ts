import { IWorkerBridge, WorkerRequest, WorkerResponse } from '@rem-web/use-cases';
//
// import {IWorkerBridge, WorkerRequest, WorkerResponse } from "../../../../use-cases/src";

export class WebWorkerBridge implements IWorkerBridge {
    private worker: Worker;
    // Храним функции resolve/reject для ожидающих Promise
    private pendingRequests = new Map<
        string,
        { resolve: (value: any) => void; reject: (reason?: any) => void }
    >();
    // Храним слушателей для широковещательных событий от воркера (например, прогресс синхронизации)
    private listeners = new Map<string, Set<(data: any) => void>>();

    constructor(worker: Worker) {
        this.worker = worker;
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = this.handleError.bind(this);
    }

    public async send<TResponse, TPayload = unknown>(
        type: string,
        payload: TPayload
    ): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            // Генерируем уникальный ID запроса (встроенный метод в современных браузерах и Node)
            const correlationId = crypto.randomUUID();
            this.pendingRequests.set(correlationId, { resolve, reject });

            const request: WorkerRequest<TPayload> = {
                correlationId,
                type,
                payload,
            };

            this.worker.postMessage(request);
        });
    }

    public on<TEvents>(
        eventType: string,
        handler: (eventData: TEvents) => void
    ): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(handler);

        // Возвращаем функцию отписки
        return () => {
            this.listeners.get(eventType)?.delete(handler);
        };
    }

    private handleMessage(event: MessageEvent<WorkerResponse | { type: string; payload: any }>) {
        const data = event.data;

        // 1. Обработка ответов на конкретные запросы (по correlationId)
        if ('correlationId' in data && data.correlationId) {
            const pending = this.pendingRequests.get(data.correlationId);
            if (pending) {
                this.pendingRequests.delete(data.correlationId);
                if (data.success) {
                    pending.resolve(data.data);
                } else {
                    pending.reject(new Error(data.error?.message || 'Worker Error'));
                }
            }
            return;
        }

        // 2. Обработка широковещательных событий (например: { type: 'SYNC_PROGRESS', payload: 50 })
        if ('type' in data && this.listeners.has(data.type)) {
            this.listeners.get(data.type)!.forEach((handler) => handler(data.payload));
        }
    }

    private handleError(error: ErrorEvent) {
        console.error('[WebWorkerBridge] Uncaught worker error:', error);
    }
}