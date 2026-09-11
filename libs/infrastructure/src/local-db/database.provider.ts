import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import {UserDocType, userSchema} from "./models/user.model";
// import { userSchema, UserDocType } from './schemas/user.schema';

if (process.env.NODE_ENV !== 'production') {
    addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBUpdatePlugin);

export type MyDatabaseCollections = {
    users: import('rxdb').RxCollection<UserDocType>;
};

export type MyDatabase = RxDatabase<MyDatabaseCollections>;

export async function initDatabase(): Promise<MyDatabase> {
    const db = await createRxDatabase<MyDatabaseCollections>({
        name: 'rem_web_rxdb',
        // Оборачиваем Dexie хранилище валидатором для поддержки dev-mode
        storage: wrappedValidateAjvStorage({
            storage: getRxStorageDexie(),
        }),
        ignoreDuplicate: true,
    });

    await db.addCollections({
        users: {
            schema: userSchema,
        },
    });

    return db;
}