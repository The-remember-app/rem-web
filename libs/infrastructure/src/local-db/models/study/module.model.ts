import { RxJsonSchema } from 'rxdb';
import { SyncState } from '../../types/sync-state.type';

export type ModuleDocType = {
    uuid: string;
    userUuid: string;
    name: string;
    description?: string | null;
    rootFolderUuid: string;
    isReverseDefinitionWrite: boolean;
    standardAndReverseWrite: boolean;
    isReverseDefinitionChoice: boolean;
    standardAndReverseChoice: boolean;
    maxIterationLen: number;
    minIterationLen: number;
    minWatchCount: number;
    knownTermPart: number;
    choicesCount: number;
    isLearnt: boolean;
    createdAt: string;
    updatedAt: string;
    personalCreatedAt: string;
    personalUpdatedAt: string;
    syncState: SyncState;
    personalSyncState: SyncState;
};

export const moduleSchema: RxJsonSchema<ModuleDocType> = {
    title: 'module schema',
    version: 0,
    description: 'Study module',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        description: { type: ['string', 'null'] },
        rootFolderUuid: { type: 'string', maxLength: 100 },
        isReverseDefinitionWrite: { type: 'boolean' },
        standardAndReverseWrite: { type: 'boolean' },
        isReverseDefinitionChoice: { type: 'boolean' },
        standardAndReverseChoice: { type: 'boolean' },
        maxIterationLen: { type: 'integer' },
        minIterationLen: { type: 'integer' },
        minWatchCount: { type: 'integer' },
        knownTermPart: { type: 'number' },
        choicesCount: { type: 'integer' },
        isLearnt: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        personalCreatedAt: { type: 'string', format: 'date-time' },
        personalUpdatedAt: { type: 'string', format: 'date-time' },
        syncState: { type: 'string', maxLength: 50 },
        personalSyncState: { type: 'string', maxLength: 50 },
    },
    required: [
        'uuid',
        'userUuid',
        'name',
        'rootFolderUuid',
        'isReverseDefinitionWrite',
        'standardAndReverseWrite',
        'isReverseDefinitionChoice',
        'standardAndReverseChoice',
        'maxIterationLen',
        'minIterationLen',
        'minWatchCount',
        'knownTermPart',
        'choicesCount',
        'isLearnt',
        'createdAt',
        'updatedAt',
        'personalCreatedAt',
        'personalUpdatedAt',
        'syncState',
        'personalSyncState',
    ],
    indexes: ['userUuid', 'rootFolderUuid', 'syncState', 'personalSyncState'],
};