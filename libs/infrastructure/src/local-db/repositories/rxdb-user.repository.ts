import { IUserRepository, User } from '@rem-web/domain';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {MyDatabase} from "../database.provider";
import {UserDocType} from "../models/user.model";
// import { MyDatabase } from '../local-db/database';
// import { UserDocType } from '../local-db/schemas/user.schema';

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

    public async save(user: User): Promise<void> {
        await this.db.users.insert({
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            name: user.name,
            surname: user.surname,
            active: user.active,
            createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
        });
    }

    public async update(user: User): Promise<void> {
        const doc = await this.db.users.findOne(user.uuid).exec();
        if (doc) {
            await doc.incrementalPatch({
                username: user.username,
                email: user.email,
                name: user.name,
                surname: user.surname,
                active: user.active,
                updatedAt: new Date().toISOString(),
            });
        } else {
            await this.save(user);
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