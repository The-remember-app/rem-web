import { User } from '@rem-web/domain';

export interface UserDTO {
    uuid: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    active: boolean;
    createdAt: string ;
    updatedAt: string ;
}

export class UserDtoMapper {
    public static toDTO(user: User): UserDTO {
        return {
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            name: user.name,
            surname: user.surname,
            active: user.active,
            createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
            updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : '',
        };
    }
}