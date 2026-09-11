import { RxJsonSchema } from 'rxdb';

export type UserDocType = {
    uuid: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
};

export const userSchema: RxJsonSchema<UserDocType> = {
    title: 'user schema',
    version: 0,
    description: 'Describes a user profile',
    primaryKey: 'uuid', // Важно: RxDB требует явного указания первичного ключа
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        username: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        surname: { type: 'string' },
        active: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    required: ['uuid', 'username', 'email', 'active'],
};