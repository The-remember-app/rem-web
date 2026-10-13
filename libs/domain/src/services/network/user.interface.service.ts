import { User, UserProps } from '../../entities/study/user';

export interface IUserNetworkService {
    getById(uuid: string): Promise<User | null>;
    getMe(): Promise<User | null>;
    create(data: Partial<UserProps>): Promise<User>;
    updateMe(data: Partial<UserProps>): Promise<User>;
    delete(uuid: string): Promise<void>;
    checkUser(params?: Record<string, any>): Promise<boolean>;
    exist(params?: Record<string, any>): Promise<boolean>;
}