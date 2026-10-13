import { RxJsonSchema } from 'rxdb';
import { SyncState } from '../../types/sync-state.type';

export type UserDocType = {
    uuid: string;
    username: string;
    password?: string | null;
    email: string;
    name: string;
    surname: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    syncState: SyncState;
};

export const userSchema: RxJsonSchema<UserDocType> = {
    title: 'auth schema',
    version: 0,
    description: 'User profile',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        username: { type: 'string', maxLength: 100 },
        password: { type: ['string', 'null'] },
        email: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        surname: { type: 'string' },
        active: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        syncState: { type: 'string', maxLength: 50 },
    },
    required: ['uuid', 'username', 'email', 'name', 'surname', 'active', 'createdAt', 'updatedAt', 'syncState'],
    indexes: ['username', 'email', 'syncState'],
};