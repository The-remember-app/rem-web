import {IAuthNetworkService, IFolderNetworkService, IUserRepository} from '@rem-web/domain';
// import { } from '@rem-web/use-cases';
import { UserPresenter } from '../presenters/user.presenter';
import {
    AuthUserFrontUseCase,
    LogoutUserFrontUseCase,
    AuthUsersSyncUseCase,
    MasterSyncOrchestratorUseCase
} from '@rem-web/use-cases';
// import {AuthNetworkService} from "@rem-web/infrastructure";
// import {AuthNetworkService} from "@rem-web/infrastructure";

export interface FrontAppDependencies {
    userRepository: IUserRepository;
    authUserUseCase: AuthUserFrontUseCase;
    userPresenter: UserPresenter;
    logoutUserUseCase: LogoutUserFrontUseCase
}

export interface SyncDependencies {
    userRepository: IUserRepository;
    authSyncUseCase: AuthUsersSyncUseCase;
    authNetworkService: IAuthNetworkService;
    // userPresenter: UserPresenter;
    // logoutUserUseCase: LogoutUserFrontUseCase
    folderNetworkService: IFolderNetworkService;
    masterSyncOrchestratorUseCase: MasterSyncOrchestratorUseCase;
}
