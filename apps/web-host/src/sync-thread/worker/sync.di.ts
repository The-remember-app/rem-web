import {
    IUserRepository,
    IFolderRepository,
    IModuleRepository,
    ITermRepository,
    ITermAddingInfoRepository,
    ISentenceRepository,
    ILearnTermDatetimeMarkRepository,
    IFolderNetworkService,
    IUserNetworkService,
    IModuleNetworkService,
    ITermNetworkService,
    ITermAddingInfoNetworkService,
    ISentenceNetworkService,
    ILearnTermDatetimeMarkNetworkService
} from '@rem-web/domain';
import {
    initDatabase,
    RxDbUserRepository,
    RxDbFolderRepository,
    RxDbModuleRepository,
    RxDbTermRepository,
    RxDbTermAddingInfoRepository,
    RxDbSentenceRepository,
    RxDbLearnTermDatetimeMarkRepository,
    AuthNetworkService,
    FolderNetworkService,
    ApiResponseHandler, UserNetworkService, ModuleNetworkService, TermNetworkService, TermAddingInfoNetworkService,
    SentenceNetworkService, LearnTermDatetimeMarkNetworkService,
} from '@rem-web/infrastructure';
import {
    AuthUsersSyncUseCase,
    UserSyncUseCase,
    FolderSyncUseCase,
    ModuleSyncUseCase,
    TermSyncUseCase,
    TermAddingInfoSyncUseCase,
    SentenceSyncUseCase,
    LearnTermDatetimeMarkSyncUseCase,
    MasterSyncOrchestratorUseCase
} from '@rem-web/use-cases';
import { SyncDependencies } from '@rem-web/presentation';

export async function setupSyncDependencies(): Promise<SyncDependencies> {
    const db = await initDatabase();
    const apiResponseHandler = new ApiResponseHandler();

    // 1. Репозитории БД
    const userRepository: IUserRepository = new RxDbUserRepository(db);
    const folderRepository: IFolderRepository = new RxDbFolderRepository(db);
    const moduleRepository: IModuleRepository = new RxDbModuleRepository(db);
    const termRepository: ITermRepository = new RxDbTermRepository(db);
    const termAddingInfoRepository: ITermAddingInfoRepository = new RxDbTermAddingInfoRepository(db);
    const sentenceRepository: ISentenceRepository = new RxDbSentenceRepository(db);
    const markRepository: ILearnTermDatetimeMarkRepository = new RxDbLearnTermDatetimeMarkRepository(db);

    // 2. Сетевые сервисы
    const authNetworkService = new AuthNetworkService();
    const userNetworkService: IUserNetworkService = new UserNetworkService(apiResponseHandler);
    const folderNetworkService: IFolderNetworkService = new FolderNetworkService(apiResponseHandler);
    const moduleNetworkService: IModuleNetworkService = new ModuleNetworkService(apiResponseHandler);
    const termNetworkService: ITermNetworkService = new TermNetworkService(apiResponseHandler);
    const termAddingInfoNetworkService: ITermAddingInfoNetworkService = new TermAddingInfoNetworkService(apiResponseHandler);
    const sentenceNetworkService: ISentenceNetworkService = new SentenceNetworkService(apiResponseHandler);
    const markNetworkService: ILearnTermDatetimeMarkNetworkService = new LearnTermDatetimeMarkNetworkService(apiResponseHandler);

    // 3. Сервис разрешения коллизий
    const collisionResolver = new CollisionResolverService();

    // 4. Юзкейсы синхронизации отдельных сущностей
    const syncUserUseCase = new UserSyncUseCase(userNetworkService, userRepository, collisionResolver as any);
    const syncFolderUseCase = new FolderSyncUseCase(folderNetworkService, folderRepository, collisionResolver as any);
    const syncModuleUseCase = new ModuleSyncUseCase(moduleNetworkService, moduleRepository, collisionResolver as any);
    const syncTermUseCase = new TermSyncUseCase(termNetworkService, termRepository, collisionResolver as any);
    const syncTermAddingInfoUseCase = new TermAddingInfoSyncUseCase(termAddingInfoNetworkService, termAddingInfoRepository, collisionResolver as any);
    const syncSentenceUseCase = new SentenceSyncUseCase(sentenceNetworkService, sentenceRepository, collisionResolver as any);
    const syncLearnTermDatetimeMarkUseCase = new LearnTermDatetimeMarkSyncUseCase(markNetworkService, markRepository, collisionResolver as any);
    const syncProgressUseCase = {
        execute: async () => ({ success: true, syncedCount: 0 })
    };

    // 5. Главный оркестратор
    const masterSyncOrchestratorUseCase = new MasterSyncOrchestratorUseCase(
        syncUserUseCase,
        syncFolderUseCase,
        syncModuleUseCase,
        syncTermUseCase,
        syncTermAddingInfoUseCase,
        syncSentenceUseCase,
        syncLearnTermDatetimeMarkUseCase,
        syncProgressUseCase
    );

    // 6. Юзкейс авторизации
    const authSyncUseCase = new AuthUsersSyncUseCase(authNetworkService, userRepository);

    return {
        userRepository,
        authSyncUseCase,
        authNetworkService,
        folderNetworkService,
        masterSyncOrchestratorUseCase,
    };
}