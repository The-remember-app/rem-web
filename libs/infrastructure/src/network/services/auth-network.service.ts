import { User, IUserRepository } from '@rem-web/domain';
import {
    loginForAccessTokenTokenPost,
    readUsersMeMeGet,
    UserDto,
    BodyLoginForAccessTokenTokenPost,
} from '../api/generated/code';
import {setGlobalAccessToken} from "../api/api-client";
// import {setGlobalAccessToken} from "../api/generated/hey-api";

// import { setGlobalAccessToken } from '../api/api-client';

export class AuthNetworkService {
    constructor(private readonly userRepository: IUserRepository) {}

    public async login(credentials: BodyLoginForAccessTokenTokenPost): Promise<User> {
        // 1 & 2. Отправка запроса на получение токена
        const loginResponse = await loginForAccessTokenTokenPost({
            body: {
                username: credentials.username,
                password: credentials.password,
            },
        });

        // 3. Заглушка обработки ошибки авторизации
        if (loginResponse.error || !loginResponse.data?.access_token) {
            // TODO: Добавить разбор ошибок 401 / 422 от FastAPI/Swagger
            console.error('[AuthService] Login error:', loginResponse.error);
            throw new Error('Authentication failed: Invalid credentials or server error.');
        }

        const token = loginResponse.data.access_token;

        // 6. Сохранение токена доступа для последующих запросов
        // console.log(token);
        setGlobalAccessToken(token);

        // 4. Запрос данных текущего пользователя
        const userMeResponse = await readUsersMeMeGet();

        if (userMeResponse.error || !userMeResponse.data?.data) {
            // TODO: Заглушка обработки ошибки получения профиля
            console.error('[AuthService] Fetch /user/me error:', userMeResponse.error);
            throw new Error('Failed to fetch user profile after authentication.');
        }

        const userDto = userMeResponse.data.data as UserDto;

        // 5. Преобразование DTO в сущность Domain и сохранение в локальную БД
        const userDomain = new User({
            uuid: userDto.id,
            username: userDto.username,
            email: userDto.email,
            name: userDto.name,
            surname: userDto.surname,
            active: true,
            createdAt: new Date(userDto.created_at),
            updatedAt: new Date(userDto.updated_at),
        });

        await this.userRepository.save(userDomain);

        return userDomain;
    }
}