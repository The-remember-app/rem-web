import {createRxDatabase, addRxPlugin, RxDatabase, RxCollection} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import {UserDocType, userSchema} from "./models/study/user.model";
import {FolderDocType, folderSchema} from "./models/study/folder.model";
import {ModuleDocType, moduleSchema} from "./models/study/module.model";
import {TermDocType, termSchema} from "./models/study/term.model";
import {SentenceDocType, sentenceSchema} from "./models/study/sentence.model";
import {TermAddingInfoDocType, termAddingInfoSchema} from "./models/study/term-adding-info.model";
import {LearnTermDatetimeMarkDocType, learnTermDatetimeMarkSchema} from "./models/study/learn-term-datetime-mark.model";
import {deletedEntitySchema} from "./models/sync/deleted-entity.model";
import {syncRuleSchema} from "./models/sync/sync-rule.model";
// import { userSchema, UserDocType } from './schemas/auth.schema';

if (process.env.NODE_ENV !== 'production') {
    addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBUpdatePlugin);

export type MyDatabaseCollections = {
    users: RxCollection<UserDocType>;
    folders: RxCollection<FolderDocType>;
    modules: RxCollection<ModuleDocType>;
    terms: RxCollection<TermDocType>;
    sentences: RxCollection<SentenceDocType>;
    termAddingInfos: RxCollection<TermAddingInfoDocType>;
    learnMarks: RxCollection<LearnTermDatetimeMarkDocType>;
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
        users: { schema: userSchema },
        folders: { schema: folderSchema },
        modules: { schema: moduleSchema },
        terms: { schema: termSchema },
        sentences: { schema: sentenceSchema },
        termAddingInfos: { schema: termAddingInfoSchema },
        learnMarks: { schema: learnTermDatetimeMarkSchema },
        deletedEntity: {schema: deletedEntitySchema},
        syncRule: {schema: syncRuleSchema},
    });

    return db;
}