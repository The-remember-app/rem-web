import { IUserRepository } from '@rem-web/domain';
import {AuthUsersSyncUseCase, LogoutUserFrontUseCase} from '@rem-web/use-cases';
import { UserPresenter } from '../presenters/user.presenter';
import {AuthUserFrontUseCase} from "@rem-web/use-cases";
import {AuthNetworkService} from "@rem-web/infrastructure";

export interface FrontAppDependencies {
    userRepository: IUserRepository;
    authUserUseCase: AuthUserFrontUseCase;
    userPresenter: UserPresenter;
    logoutUserUseCase: LogoutUserFrontUseCase
}

export interface SyncDependencies {
    userRepository: IUserRepository;
    authSyncUseCase: AuthUsersSyncUseCase;
    authNetworkService: AuthNetworkService;
    // userPresenter: UserPresenter;
    // logoutUserUseCase: LogoutUserFrontUseCase
}
