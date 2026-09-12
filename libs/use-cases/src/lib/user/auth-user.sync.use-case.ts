import {User, IUserRepository, IAuthNetworkService} from '@rem-web/domain';
import { LoginRequestDto, AuthResponseDto, WORKER_COMMANDS } from '../dto/auth.dto';
import {IWorkerBridge} from "../bridge/worker-bridge.interface";

export class AuthUsersSyncUseCase {
    constructor(
        private readonly networkService: IAuthNetworkService,
        private readonly userRepository: IUserRepository
    ) {}

    public async execute(credentials: any): Promise<AuthResponseDto> {
        // 1. Делаем сетевой запрос (Инфраструктура: Сеть)
        const token = await this.networkService.login(credentials);
        this.networkService.setToken(token);
        const user = await this.networkService.getCurrentUser();
        // 2. Сохраняем в БД (Инфраструктура: БД)

        // 5. Преобразование DTO в сущность Domain и сохранение в локальную БД
        const exists = await this.userRepository.getById(user.uuid);

        if (exists) {
            await this.userRepository.update(user);
        } else {
            await this.userRepository.save(user);
        }

        return {
            accessToken: token, // Предполагается, что токен внутри
            refreshToken: token,
            user,
        };
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