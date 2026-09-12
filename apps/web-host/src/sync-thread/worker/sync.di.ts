import { initDatabase, RxDbUserRepository, AuthNetworkService } from '@rem-web/infrastructure';
import { AuthUsersSyncUseCase } from '@rem-web/use-cases';
import {SyncDependencies} from "@rem-web/presentation";

// export interface SyncDependencies {
//     authSyncUseCase: AuthUsersSyncUseCase;
//     userRepository: RxDbUserRepository;
//     authNetworkService: AuthNetworkService;
// }

export async function setupSyncDependencies(): Promise<SyncDependencies> {
    const db = await initDatabase();

    // Инфраструктура
    const userRepository = new RxDbUserRepository(db);
    const authNetworkService = new AuthNetworkService(); // Убрали зависимость от БД!

    // UseCases (внедряем абстракции, хотя в JS передаем конкретные реализации)
    const authSyncUseCase = new AuthUsersSyncUseCase(authNetworkService, userRepository);

    return {
        authSyncUseCase,
        userRepository,
        authNetworkService,
    };
}