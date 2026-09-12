import { FrontAppDependencies, UserPresenter, store } from '@rem-web/presentation';
import { AuthUserFrontUseCase, LogoutUserFrontUseCase } from '@rem-web/use-cases';
import { RxDbUserRepository, WebWorkerBridge, initDatabase } from '@rem-web/infrastructure';

// Импорт Vite worker
import SyncWorker from '../../sync-thread/worker/sync.worker.run?worker';

export interface FrontDIScope {
    dependencies: FrontAppDependencies;
    dispose: () => void;
}

export async function setupFrontDependencies(): Promise<FrontDIScope> {
    console.log('[Front DI] Initializing dependencies...');

    // 1. Инициализация Web Worker и Bridge
    const worker = new SyncWorker();
    const workerBridge = new WebWorkerBridge(worker);

    worker.addEventListener('error', (event) => {
        console.error('[SyncWorker Error]:', event);
    });

    // 2. Инициализация БД и Репозиториев (Конкретная реализация подключается ТОЛЬКО ЗДЕСЬ)
    const db = await initDatabase();
    const userRepository = new RxDbUserRepository(db);

    // 3. Инициализация Use Cases
    const authUserUseCase = new AuthUserFrontUseCase(userRepository, workerBridge);
    const logoutUserUseCase = new LogoutUserFrontUseCase(userRepository);

    // 4. Инициализация Presenter
    const userPresenter = new UserPresenter(userRepository, store.dispatch);

    const dependencies: FrontAppDependencies = {
        userRepository, // Автоматически кастится к IUserRepository
        authUserUseCase,
        logoutUserUseCase,
        userPresenter,
    };

    // Функция для корректного завершения воркера при размонтировании
    const dispose = () => {
        console.log('[Front DI] Disposing and terminating worker thread...');
        worker.terminate();
    };

    return { dependencies, dispose };
}