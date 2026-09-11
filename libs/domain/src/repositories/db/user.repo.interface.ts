
import { Observable } from 'rxjs';

import { User } from '../../entities/user';

export interface IUserRepository {
    getById(uuid: string): Promise<User | null>;
    getByUsername(username: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
    delete(uuid: string): Promise<void>;
    // Реактивный поток, отдающий чистую сущность Domain
    observeActiveUser(): Observable<User | null>;
    clearActiveUser():  Promise<void>;
}
