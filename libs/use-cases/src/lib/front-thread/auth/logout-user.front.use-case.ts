import { IUserRepository } from '@rem-web/domain';

export class LogoutUserFrontUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    public async execute(): Promise<void> {
        // Единственное действие — деактивация пользователя в БД
        await this.userRepository.clearActiveUser();
    }
}