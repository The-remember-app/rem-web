import { IUserRepository } from '@rem-web/domain';
import {AuthUserUseCase, LogoutUserUseCase} from '@rem-web/use-cases';
import { UserPresenter } from '../presenters/user.presenter';

export interface AppDependencies {
    userRepository: IUserRepository;
    authUserUseCase: AuthUserUseCase;
    userPresenter: UserPresenter;
    logoutUserUseCase: LogoutUserUseCase
}
