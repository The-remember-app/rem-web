/// <reference lib="webworker" />
import { WorkerRequest, WorkerResponse, WORKER_COMMANDS } from '@rem-web/use-cases';
import { setupSyncDependencies, SyncDependencies } from './sync.di';

let dependencies: SyncDependencies | null = null;
const workerReady: Promise<void> = bootstrapWorker();

async function bootstrapWorker(): Promise<void> {
    dependencies = await setupSyncDependencies();

    dependencies.userRepository.observeActiveUser().subscribe({
        next: (user: any) => {
            if (user?.active) {
                console.log('[Worker Auth] Active user detected:', user.uuid);
            } else {
                dependencies?.authNetworkService!.setToken(null)
                console.log('[Worker Auth] User deactivated. Access token cleared.');
            }
        },
        error: (err: any) => {
            console.error('[Worker Auth] Error observing user state:', err);
            dependencies?.authNetworkService!.setToken(null)
        },
    });
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const { correlationId, type, payload } = event.data;

    try {
        await workerReady;
        if (!dependencies) throw new Error('Worker dependencies are not initialized');

        let resultData: unknown;

        switch (type) {
            case WORKER_COMMANDS.AUTH_LOGIN: {
                // Вызов UseCase через чистую архитектуру
                resultData = await dependencies.authSyncUseCase.execute(payload);
                break;
            }
            case WORKER_COMMANDS.SYNC_FULL:
                // resultData = await dependencies.syncFullUseCase.execute();
                break;
            default:
                throw new Error(`Unknown command type: ${type}`);
        }

        self.postMessage({ correlationId, success: true, data: resultData } as WorkerResponse);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        self.postMessage({
            correlationId,
            success: false,
            error: { code: 'WORKER_ERROR', message },
        } as WorkerResponse);
    }
};