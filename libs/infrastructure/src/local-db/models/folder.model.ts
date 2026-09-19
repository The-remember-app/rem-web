import { RxJsonSchema } from 'rxdb';

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
    ],
    indexes: ['userUuid', 'authorUuid'],
};