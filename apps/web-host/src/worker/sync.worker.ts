/// <reference lib="webworker" />

import {
    WorkerRequest,
    WorkerResponse,
    WORKER_COMMANDS,
    AuthResponseDto,
} from '@rem-web/use-cases';
import {
    RxDbUserRepository,
    initDatabase,
    AuthNetworkService,
    getGlobalAccessToken,
    setGlobalAccessToken,
} from '@rem-web/infrastructure';

let userRepository: RxDbUserRepository | null = null;
let authNetworkService: AuthNetworkService | null = null;

/**
 * Один промис на всю жизнь воркера.
 * Стартует сразу при загрузке модуля, без top-level await.
 * Повторные await просто ждут тот же промис — гонки init нет.
 */
const workerReady: Promise<void> = bootstrapWorker();

async function bootstrapWorker(): Promise<void> {
    const db = await initDatabase();

    userRepository = new RxDbUserRepository(db);
    authNetworkService = new AuthNetworkService(userRepository);

    userRepository.observeActiveUser().subscribe({
        next: (user) => {
            if (user?.active) {
                console.log('[Worker Auth] Active user detected:', user.uuid);
            } else {
                setGlobalAccessToken(null);
                console.log('[Worker Auth] User deactivated. Access token cleared.');
            }
        },
        error: (err) => {
            console.error('[Worker Auth] Error observing user state:', err);
            setGlobalAccessToken(null);
        },
    });
}

// ВАЖНО: регистрация синхронная, до завершения bootstrapWorker.
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const { correlationId, type, payload } = event.data;

    try {
        await workerReady;

        if (!authNetworkService || !userRepository) {
            throw new Error('Worker database is not initialized');
        }

        let resultData: unknown;

        switch (type) {
            case WORKER_COMMANDS.AUTH_LOGIN: {
                const user = await authNetworkService.login(payload as any);

                const bridgeAnswer: AuthResponseDto = {
                    accessToken: getGlobalAccessToken(),
                    refreshToken: '', // TODO: добавить refresh token
                    user,
                };

                sendResponse({
                    correlationId,
                    success: true,
                    data: bridgeAnswer,
                });
                return;
            }

            case WORKER_COMMANDS.SYNC_FULL:
                // resultData = await handleFullSync();
                break;

            default:
                throw new Error(`Unknown command type: ${type}`);
        }

        sendResponse({
            correlationId,
            success: true,
            data: resultData,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const isInitError = !authNetworkService;

        sendResponse({
            correlationId,
            success: false,
            error: {
                code: isInitError
                    ? 'WORKER_INIT_ERROR'
                    : type === WORKER_COMMANDS.AUTH_LOGIN
                        ? 'AUTH_LOGIN'
                        : 'WORKER_ERROR',
                message,
            },
        });
    }
};

function sendResponse(response: WorkerResponse) {
    self.postMessage(response);
}