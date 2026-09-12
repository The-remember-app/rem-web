import { User } from '../../entities/user';

export interface IAuthNetworkService {
    login(credentials: any): Promise<string>;
    setToken(token: string|null): void;
    getCurrentUser(): Promise<User>;
    // ...
}