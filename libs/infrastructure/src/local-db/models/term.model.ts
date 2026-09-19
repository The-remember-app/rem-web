import { RxJsonSchema } from 'rxdb';

export type TermDocType = {
    uuid: string;
    userUuid: string;
    term: string;
    definition: string;
    moduleUuid: string;
    chooseErrorCounter: number;
    writeErrorCounter: number;
    choiceNegErrorCounter: number;
    watchCount: number;
    createdAt: string;
    updatedAt: string;
    personalCreatedAt: string;
    personalUpdatedAt: string;
};

export const termSchema: RxJsonSchema<TermDocType> = {
    title: 'term schema',
    version: 0,
    description: 'Flashcard / Term entity',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        term: { type: 'string' },
        definition: { type: 'string' },
        moduleUuid: { type: 'string', maxLength: 100 },
        chooseErrorCounter: { type: 'integer' },
        writeErrorCounter: { type: 'integer' },
        choiceNegErrorCounter: { type: 'integer' },
        watchCount: { type: 'integer' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        personalCreatedAt: { type: 'string', format: 'date-time' },
        personalUpdatedAt: { type: 'string', format: 'date-time' },
    },
    required: [
        'uuid',
        'userUuid',
        'term',
        'definition',
        'moduleUuid',
        'chooseErrorCounter',
        'writeErrorCounter',
        'choiceNegErrorCounter',
        'watchCount',
        'createdAt',
        'updatedAt',
        'personalCreatedAt',
        'personalUpdatedAt',
    ],
    indexes: ['userUuid', 'moduleUuid'],
};
