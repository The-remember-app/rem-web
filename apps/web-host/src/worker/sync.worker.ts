import {WorkerRequest, WorkerResponse, WORKER_COMMANDS, AuthResponseDto} from '@rem-web/use-cases';

// import { WorkerRequest, WORKER_COMMANDS } from '@rem-web/use-cases';
import {WatermelonUserRepository, database, AuthNetworkService, getGlobalAccessToken} from '@rem-web/infrastructure';
// import {getGlobalAccessToken} from "../../../../libs/infrastructure/src/network/api/api-client";
// import {getGlobalAccessToken} from "@rem-web/infrastructure";
// import {AuthNetworkService} from "../../../../libs/infrastructure/src/network/services/auth-network.service";
// import {  } from './services/auth-network.service';

const userRepository = new WatermelonUserRepository(database);
const authNetworkService = new AuthNetworkService(userRepository);


// Внутреннее состояние воркера. Безопасно изолировано от UI-потока.
// let memoryAccessToken: string | null = null;
// let memoryRefreshToken: string | null = null;

// Слушаем сообщения из главного потока
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const { correlationId, type, payload } = event.data;

    try {
        let resultData;

        switch (type) {
            case WORKER_COMMANDS.AUTH_LOGIN:
                // 1. Принимаем credentials из сообщения
                const user = await authNetworkService.login(payload as any);
                const bridgeAnswer: AuthResponseDto = {
                    accessToken: getGlobalAccessToken(),
                    refreshToken: "", // TODO: добавить рефреш токен,
                    user: user,
                }
                self.postMessage({
                    correlationId,
                    success: true,
                    data: bridgeAnswer,
                });
                return;

            case WORKER_COMMANDS.SYNC_FULL:
                // resultData = await handleFullSync();
                break;

            default:
                throw new Error(`Unknown command type: ${type}`);
        }

        // Отправляем успешный ответ
        sendResponse({
            correlationId,
            success: true,
            data: resultData,
        });
    } catch (error: any) {
        // Отправляем ошибку
        let errCode = 'WORKER_ERROR';
        if (type === WORKER_COMMANDS.AUTH_LOGIN) {
            errCode = 'AUTH_LOGIN';
        }

        sendResponse({
            correlationId,
            success: false,
            error: { code: errCode, message: error.message },
        });

    }
};

function sendResponse(response: WorkerResponse) {
    self.postMessage(response);
}
