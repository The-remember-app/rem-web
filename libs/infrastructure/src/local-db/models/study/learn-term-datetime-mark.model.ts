import { RxJsonSchema } from 'rxdb';
import { SyncState } from '../../types/sync-state.type';

export type LearnTermDatetimeMarkDocType = {
    uuid: string;
    userUuid: string;
    termUuid: string;
    startWatch: string;
    endWatch: string;
    isLearnt: boolean;
    isLearnIterStart: boolean;
    watchType: string;
    createdAt: string;
    updatedAt: string;
    syncState: SyncState;
};

export const learnTermDatetimeMarkSchema: RxJsonSchema<LearnTermDatetimeMarkDocType> = {
    title: 'learn term datetime mark schema',
    version: 0,
    description: 'Learning timestamps and progress marks',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        termUuid: { type: 'string', maxLength: 100 },
        startWatch: { type: 'string', format: 'date-time' },
        endWatch: { type: 'string', format: 'date-time' },
        isLearnt: { type: 'boolean' },
        isLearnIterStart: { type: 'boolean' },
        watchType: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        syncState: { type: 'string', maxLength: 50 },
    },
    required: [
        'uuid',
        'userUuid',
        'termUuid',
        'startWatch',
        'endWatch',
        'isLearnt',
        'isLearnIterStart',
        'watchType',
        'createdAt',
        'updatedAt',
        'syncState',
    ],
    indexes: ['userUuid', 'termUuid', 'syncState'],
};