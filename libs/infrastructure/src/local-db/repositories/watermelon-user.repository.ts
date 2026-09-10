import {Database, Q} from '@nozbe/watermelondb';
import { IUserRepository, User } from '@rem-web/domain';
import UserModel from '../models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class WatermelonUserRepository implements IUserRepository {
    constructor(private readonly database: Database) {}

    async getById(uuid: string): Promise<User | null> {
        try {
            const record = await this.database.get<UserModel>('users').find(uuid);
            return this.toDomain(record);
        } catch {
            return null;
        }
    }

    async getByUsername(username: string): Promise<User | null> {
        const records = await this.database
            .get<UserModel>('users')
            .query(Q.where('username', username))
            .fetch();

        return records.length > 0 ? this.toDomain(records[0]) : null;
    }

    async getByEmail(email: string): Promise<User | null> {
        const records = await this.database
            .get<UserModel>('users')
            .query(Q.where('email', email))
            .fetch();

        return records.length > 0 ? this.toDomain(records[0]) : null;
    }

    async save(user: User): Promise<void> {
        const usersCollection = this.database.get<UserModel>('users');

        await this.database.write(async () => {
            let existingRecord: UserModel | null = null;
            try {
                existingRecord = await usersCollection.find(user.uuid);
            } catch {
                // Запись не найдена, создадим новую
            }

            if (existingRecord) {
                await existingRecord.update((record) => {
                    record.username = user.username;
                    record.email = user.email;
                    record.name = user.name;
                    record.surname = user.surname;
                    record.active = user.active;
                    record.updatedAt = user.updatedAt;
                });
            } else {
                await usersCollection.create((record) => {
                    // Принудительно задаем id равным доменному uuid
                    record._raw.id = user.uuid;
                    record.username = user.username;
                    record.email = user.email;
                    record.name = user.name;
                    record.surname = user.surname;
                    record.active = user.active;
                    record.createdAt = user.createdAt;
                    record.updatedAt = user.updatedAt;
                });
            }
        });
    }

    async update(user: User): Promise<void> {
        await this.save(user);
    }

    async delete(uuid: string): Promise<void> {
        const usersCollection = this.database.get<UserModel>('users');
        await this.database.write(async () => {
            const record = await usersCollection.find(uuid);
            await record.markAsDeleted(); // Soft delete для синхронизации
            await record.destroyPermanently();
        });
    }

    private toDomain(record: UserModel): User {
        return new User({
            uuid: record.id,
            username: record.username,
            email: record.email,
            name: record.name,
            surname: record.surname,
            active: record.active,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    observeActiveUser(): Observable<User | null> {
        return this.database
            .get<UserModel>('users')
            .query()
            .observe()
            .pipe(
                map((users) => {
                    const active = users.find((u) => u.active);
                    return active ? this.toDomain(active) : null;
                })
            );
    }
}