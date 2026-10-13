import { IUserNetworkService, User, UserProps } from '@rem-web/domain';
import { UserMapper } from '../mappers/user.mapper';
import { ApiResponseHandler } from '../api-response-handler';
import {
    getUserIdUserIdGet,
    readUsersMeMeGet,
    createUserCreatePost,
    updateUserEntityMeUpdatePut,
    checkUserCheckUserGet,
    existUserExistGet,
    UserDto
} from '../api/generated/code';

export class UserNetworkService implements IUserNetworkService {
    constructor(private readonly responseHandler: ApiResponseHandler) {}

    /**
     * Получить данные пользователя по его UUID
     */
    public async getById(uuid: string): Promise<User | null> {
        const response = await getUserIdUserIdGet({
            path: { user_id: uuid },
        });

        const dto = this.responseHandler.handle<UserDto>(response);
        return dto ? UserMapper.toDomain(dto) : null;
    }

    /**
     * Получить профиль текущего авторизованного пользователя
     */
    public async getMe(): Promise<User | null> {
        const response = await readUsersMeMeGet();

        const dto = this.responseHandler.handle<UserDto>(response);
        return dto ? UserMapper.toDomain(dto) : null;
    }

    /**
     * Зарегистрировать нового пользователя
     */
    public async create(data: Partial<UserProps>): Promise<User> {
        const response = await createUserCreatePost({
            body: UserMapper.toCreateDto(data),
        });

        const dto = this.responseHandler.handle<UserDto>(response);
        return UserMapper.toDomain(dto);
    }

    /**
     * Обновить данные профиля текущего пользователя
     */
    public async updateMe(data: Partial<UserProps>): Promise<User> {
        const response = await updateUserEntityMeUpdatePut({
            body: UserMapper.toUpdateDto(data),
        });

        const dto = this.responseHandler.handle<UserDto>(response);
        return UserMapper.toDomain(dto);
    }

    /**
     * Удаление пользователя не поддерживается API напрямую
     */
    public async delete(_uuid: string): Promise<void> {
        throw new Error('Delete operation is not supported for User');
    }

    /**
     * Проверка валидности/занятости учетных данных пользователя
     */
    public async checkUser(params?: Record<string, any>): Promise<boolean> {
        const response = await checkUserCheckUserGet({
            query: params as ({'username': string;
                'password': string;}),
        });

        const result = this.responseHandler.handle<boolean>(response);
        return Boolean(result);
    }

    /**
     * Проверка существования пользователя по параметрам
     */
    public async exist(params?: Record<string, any>): Promise<boolean> {
        const response = await existUserExistGet({
            query: params as ({'user_id': string}),
        });

        const result = this.responseHandler.handle<boolean>(response);
        return Boolean(result);
    }
}