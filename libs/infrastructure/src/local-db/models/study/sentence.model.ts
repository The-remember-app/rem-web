import { RxJsonSchema } from 'rxdb';
import { SyncState } from '../../types/sync-state.type';

export type SentenceDocType = {
    uuid: string;
    userUuid: string;
    sentence?: string | null;
    translate?: string | null;
    termUuid: string;
    createdAt: string;
    updatedAt: string;
    syncState: SyncState;
};

export const sentenceSchema: RxJsonSchema<SentenceDocType> = {
    title: 'sentence schema',
    version: 0,
    description: 'Example sentence for terms',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        sentence: { type: ['string', 'null'] },
        translate: { type: ['string', 'null'] },
        termUuid: { type: 'string', maxLength: 100 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        syncState: { type: 'string', maxLength: 50 },
    },
    required: ['uuid', 'userUuid', 'termUuid', 'createdAt', 'updatedAt', 'syncState'],
    indexes: ['userUuid', 'termUuid', 'syncState'],
};