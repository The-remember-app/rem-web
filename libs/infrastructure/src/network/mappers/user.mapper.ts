// import { User, UserProps } from '../../entities/study/user';
import {
    UserDto,
    CreateUserDto,
    UpdateUserDto,
} from '../api/generated/code';
import {User, UserProps} from "@rem-web/domain";

export class UserMapper {
    public static toDomain(dto: UserDto): User {
        return new User({
            uuid: dto.id,
            username: dto.username,
            email: dto.email,
            name: dto.name,
            surname: dto.surname,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at ?? dto.created_at),
            active:  false,
        });
    }

    public static toCreateDto(data: Partial<UserProps>): CreateUserDto {
        return {
            id: data.uuid,
            username: data.username ?? '',
            email: data.email ?? '',
            name: data.name ?? '',
            surname: data.surname ?? '',
            password: data.password ?? '',
        };
    }

    public static toUpdateDto(data: Partial<UserProps>): UpdateUserDto {
        return {
            // username: data.username,
            // email: data.email,
            name: data.name,
            surname: data.surname,
            updated_at: (data.updatedAt ?? new Date()).toISOString(),
            // password: data.password ?? undefined,
        };
    }
}