import { RxDatabase } from 'rxdb';
import { Observable, map } from 'rxjs';
import { toDate, toIsoString } from './tools';
import {IUserRepository, User, UserProps} from "@rem-web/domain";
// import {pipe} from "@nozbe/watermelondb/utils/fp";



export class RxDbUserRepository implements IUserRepository {
    constructor(private readonly db: RxDatabase) {}

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
        };
    }

    async save(entity: User): Promise<void> {
        await this.db.users.insert(this.toDocument(entity));
    }

    async upsert(entity: User): Promise<void> {
        await this.db.users.upsert(this.toDocument(entity));
    }

    async update(uuid: string, data: Partial<UserProps>): Promise<void> {
        const doc = await this.db.users.findOne({ selector: { uuid } }).exec();
        if (!doc) return;
        const patchData: Record<string, any> = { ...data };
        if (data.createdAt) patchData.createdAt = toIsoString(data.createdAt);
        if (data.updatedAt) patchData.updatedAt = toIsoString(data.updatedAt);
        await doc.patch(patchData);
    }

    async delete(uuid: string): Promise<void> {
        const doc = await this.db.users.findOne({ selector: { uuid } }).exec();
        if (doc) await doc.remove();
    }

    async findByPk(uuid: string): Promise<User | null> {
        return this.getById(uuid);
    }

    observeByPk(uuid: string): Observable<User | null> {
        return (this.db.users.findOne({ selector: { uuid } }).$ as Observable<any>).pipe(
            map(doc => (doc ? this.toDomain(doc.toMutableJSON ? doc.toMutableJSON() : doc.toJSON()) : null))
        );
    }

    public observeActiveUser(): Observable<User | null> {
        return this.db.users
            .find({
                selector: { active: true },
            })
            .$
            .pipe(
                map((users) => {
                    return users.length > 0 ? this.toDomain(users[0]) : null;
                })
            );
    }

    public async clearActiveUser(): Promise<void> {
        const activeUsers = await this.db.users
            .find({ selector: { active: true } })
            .exec();

        for (const userDoc of activeUsers) {
            await userDoc.incrementalPatch({
                active: false,
                updatedAt: new Date().toISOString()
            });
        }
    }


    async getById(uuid: string): Promise<User | null> {
        const doc = await this.db.users.findOne({ selector: { uuid } }).exec();
        return doc ? this.toDomain(doc.toJSON()) : null;
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

    async saveBatch(entities: User[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.users.bulkInsert(entities.map(e => this.toDocument(e)));
    }

    async upsertBatch(entities: User[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.users.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async updateBatch(entities: User[]): Promise<void> {
        if (entities.length === 0) return;
        await this.db.users.bulkUpsert(entities.map(e => this.toDocument(e)));
    }

    async deleteBatch(entities: User[]): Promise<void> {
        if (entities.length === 0) return;
        const uuids = entities.map(e => e.uuid);
        await this.db.users.find({ selector: { uuid: { $in: uuids } } }).remove();
    }

    // observeActiveUser(): Observable<User | null> {
    //     return this.db.users.findOne({ selector: { active: true } }).$:pipe(
    //         map(doc => (doc ? this.toDomain(doc.toJSON()) : null))
    //     );
    // }

    // async clearActiveUser(): Promise<void> {
    //     const activeDocs = await this.db.users.find({ selector: { active: true } }).exec();
    //     await Promise.all(activeDocs.map(doc => doc.patch({ active: false })));
    // }
}


/*

export class RxDbUserRepository implements IUserRepository {
    constructor(private readonly db: MyDatabase) {}

    public observeActiveUser(): Observable<User | null> {
        return this.db.users
            .find({
                selector: { active: true },
            })
            .$
            .pipe(
                map((users) => {
                    return users.length > 0 ? this.toDomain(users[0]) : null;
                })
            );
    }

    public async getById(uuid: string): Promise<User | null> {
        const doc = await this.db.users.findOne(uuid).exec();
        return doc ? this.toDomain(doc) : null;
    }

    public async getByUsername(username: string): Promise<User | null> {
        const doc = await this.db.users.findOne({
            selector: { username },
        }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    public async getByEmail(email: string): Promise<User | null> {
        const doc = await this.db.users.findOne({
            selector: { email },
        }).exec();
        return doc ? this.toDomain(doc) : null;
    }

    public async save(auth: User): Promise<void> {
        await this.db.users.insert({
            uuid: auth.uuid,
            username: auth.username,
            email: auth.email,
            name: auth.name,
            surname: auth.surname,
            active: auth.active,
            createdAt: auth.createdAt ? new Date(auth.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: auth.updatedAt ? new Date(auth.updatedAt).toISOString() : new Date().toISOString(),
        });
    }

    public async update(auth: User): Promise<void> {
        const doc = await this.db.users.findOne(auth.uuid).exec();
        if (doc) {
            await doc.incrementalPatch({
                username: auth.username,
                email: auth.email,
                name: auth.name,
                surname: auth.surname,
                active: auth.active,
                updatedAt: new Date().toISOString(),
            });
        } else {
            await this.save(auth);
        }
    }

    public async delete(uuid: string): Promise<void> {
        const doc = await this.db.users.findOne(uuid).exec();
        if (doc) {
            await doc.remove();
        }
    }

    public async clearActiveUser(): Promise<void> {
        const activeUsers = await this.db.users
            .find({ selector: { active: true } })
            .exec();

        for (const userDoc of activeUsers) {
            await userDoc.incrementalPatch({
                active: false,
                updatedAt: new Date().toISOString()
            });
        }
    }

    private toDomain(doc: UserDocType): User {
        return new User({
            uuid: doc.uuid,
            username: doc.username,
            email: doc.email,
            name: doc.name,
            surname: doc.surname,
            active: doc.active,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
        });
    }
}
 */