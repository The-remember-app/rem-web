import { User, IUserRepository } from '@rem-web/domain';
import { LoginRequestDto, AuthResponseDto, WORKER_COMMANDS } from '../dto/auth.dto';
import {IWorkerBridge} from "../bridge/worker-bridge.interface";

export class AuthUserFrontUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly workerBridge: IWorkerBridge
    ) {}

    public async execute(dto: LoginRequestDto): Promise<User> {
        this.validate(dto);
        console.log("AuthUserFrontUseCase started");
        // 1. Отправляем сетевой запрос через Worker-поток
        const response = await this.workerBridge.send<AuthResponseDto, LoginRequestDto>(
            WORKER_COMMANDS.AUTH_LOGIN,
            dto
        );
        console.log(response);
        // 2. Создаем инстанс доменной сущности User
        // const user = new User({
        //     uuid: response.user.uuid,
        //     username: response.user.username,
        //     email: response.user.email,
        //     name: response.user.name,
        //     surname: response.user.surname,
        //     createdAt: new Date(response.user.createdAt),
        //     updatedAt: new Date(response.user.updatedAt),
        //     active: true,
        // });
        //
        // // 3. Сохраняем в локальную БД.
        // // Это ключевой момент CQRS/Offline-First: запись в БД триггерит обновление Redux/UI
        const user = await this.userRepository.getById(response.user.uuid);
        if (!user) {
            throw `User [${response.user.uuid}] does not exist`;
        }
        return user;
    }

    private validate(dto: LoginRequestDto): void {
        // if (!dto.email || !dto.email.includes('@')) {
        //     throw new Error('Invalid email address provided.');
        // }
        // if (!dto.password || dto.password.length < 6) {
        //     throw new Error('Password must be at least 6 characters long.');
        // }
    }
}