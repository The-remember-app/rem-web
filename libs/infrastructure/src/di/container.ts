import { IUserRepository } from '@rem-web/domain';
import { AuthUserUseCase, IWorkerBridge} from '@rem-web/use-cases';
import {INavigationService} from "@rem-web/presentation";
// import { INavigationService } from "@rem-web/presentation";
// import {AuthUserUseCase, IWorkerBridge} from "../../../use-cases/src";
// import {IUserRepository} from "@rem-web/domain";
// import {INavigationService} from "@rem-web/presentation";

// Контейнер хранит инстансы
export class AppContainer {
    public authUseCase: AuthUserUseCase;

    constructor(
        userRepository: IUserRepository,
        workerBridge: IWorkerBridge,
        navigationService: INavigationService
    ) {
        this.authUseCase = new AuthUserUseCase(userRepository, workerBridge);
    }
}