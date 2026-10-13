
import { Observable } from 'rxjs';

import {User, UserProps} from '../../../entities/study/user';
import {IBaseRepository} from "./abc";
import {IBaseSyncRepository} from "../sync/abs.sync.interface";

export interface IUserRepository extends IBaseRepository<User, string, UserProps>, IBaseSyncRepository<User, string, UserProps> {
    getById(uuid: string): Promise<User | null>;
    getByUsername(username: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    // save(auth: User): Promise<void>;
    // update(auth: User): Promise<void>;
    // delete(uuid: string): Promise<void>;
    // Реактивный поток, отдающий чистую сущность Domain
    findActiveUser(): Promise<User | null>;
    observeActiveUser(): Observable<User | null>;
    clearActiveUser():  Promise<void>;
}
