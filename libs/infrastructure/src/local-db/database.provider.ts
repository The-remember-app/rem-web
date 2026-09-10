import { Database } from '@nozbe/watermelondb';
// import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { myAppSchema } from './schema';
import UserModel from './models/user.model';
import ModuleModel from './models/module.model';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
// Импорт остальных моделей...

// const adapter = new SQLiteAdapter({
//     schema: myAppSchema,
//     // migrations, // если есть миграции
//     jsi: true, // Использование JSI для максимальной производительности в React Native
//     onSetUpError: (error) => {
//         console.error('Database setup failed:', error);
//     },
// });

// export const database = new Database({
//     adapter,
//     modelClasses: [
//         UserModel,
//         ModuleModel,
//         // Остальные модели классов
//     ],
// });


// import { Database } from '@nozbe/watermelondb';

// import { schema } from './schema';
// import UserModel from './models/user.model';

const adapter = new LokiJSAdapter({
    schema: myAppSchema,
    useWebWorker: false, // или true, если базы крутятся внутри worker
    useIncrementalIndexedDB: true,
    onQuotaExceededError: (error) => {
        console.error('IndexedDB quota exceeded:', error);
    },
});

export const database = new Database({
    adapter,
    modelClasses: [UserModel, ModuleModel],
});