import { RxJsonSchema } from 'rxdb';
import { SyncState } from '../../types/sync-state.type';

export type FolderDocType = {
    uuid: string;
    userUuid: string;
    name: string;
    authorUuid: string;
    rootFolderUuid?: string | null;
    createdAt: string;
    updatedAt: string;
    personalCreatedAt: string;
    personalUpdatedAt: string;
    syncState: SyncState;
    personalSyncState: SyncState;
};

export const folderSchema: RxJsonSchema<FolderDocType> = {
    title: 'folder schema',
    version: 0,
    description: 'Folders hierarchy',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        authorUuid: { type: 'string', maxLength: 100 },
        rootFolderUuid: { type: ['string', 'null'], maxLength: 100 },
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
        'authorUuid',
        'createdAt',
        'updatedAt',
        'personalCreatedAt',
        'personalUpdatedAt',
        'syncState',
        'personalSyncState',
    ],
    indexes: ['userUuid', 'authorUuid', 'syncState', 'personalSyncState'],
};