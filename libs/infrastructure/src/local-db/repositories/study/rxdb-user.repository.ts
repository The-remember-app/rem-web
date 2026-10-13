// repositories/rxdb-user.repository.ts

import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import {EntityType, IUserRepository, User, UserProps} from '@rem-web/domain';
import { toDate, toIsoString } from '../tools';
import {RxDbBaseSyncRepository} from "../sync/abs-sync.rxdb.repository";
// import {MyDatabaseCollections} from "../../database.provider";
// import {RxDbBaseSyncRepository} from "./abs.rxdb.repository";
// import { RxDbBaseSyncRepository } from './rxdb-base-sync.repository';

export class RxDbUserRepository
    extends RxDbBaseSyncRepository<User, UserProps>
    implements IUserRepository
{
    constructor(db: RxDatabase<any>) {
        super(db);
    }

    protected get collection() {
        return this.db.users;
    }

    protected get entityType(): EntityType {
        return 'user';
    }

    toDomain(doc: any): User {
        return new User({
            uuid: doc.uuid,
            username: doc.username,
            password: doc.password,
            email: doc.email,
            name: doc.name,
            surname: doc.surname,
            active: doc.active,
            createdAt: toDate(doc.createdAt),
            updatedAt: toDate(doc.updatedAt),
            syncState: doc.syncState ?? 'synced',
        });
    }

    toDocument(entity: User): Record<string, any> {
        return {
            uuid: entity.uuid,
            username: entity.username,
            password: entity.password ?? null,
            email: entity.email,
            name: entity.name,
            surname: entity.surname,
            active: entity.active,
            createdAt: toIsoString(entity.createdAt),
            updatedAt: toIsoString(entity.updatedAt),
            syncState: entity.syncState,
        };
    }

    public observeActiveUser(): Observable<User | null> {
        return this.db.users
            .find({ selector: { active: true } })
            .$
            .pipe(
                map(users => (users.length > 0 ? this.toDomain(users[0]) : null))
            );
    }

    public async clearActiveUser(): Promise<void> {
        const activeUsers = await this.db.users.find({ selector: { active: true } }).exec();
        for (const userDoc of activeUsers) {
            await userDoc.incrementalPatch({
                active: false,
                updatedAt: new Date().toISOString(),
            });
        }
    }

    async getById(uuid: string): Promise<User | null> {
        return this.findByPk(uuid);
    }

    async getByUsername(username: string): Promise<User | null> {
        const doc = await this.db.users.findOne({ selector: { username } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async getByEmail(email: string): Promise<User | null> {
        const doc = await this.db.users.findOne({ selector: { email } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }

    async findActiveUser(): Promise<User | null> {
        const doc = await this.db.users.findOne({ selector: { active: true } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
    }
}