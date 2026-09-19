import { RxJsonSchema } from 'rxdb';

export type TermAddingInfoDocType = {
    uuid: string;
    userUuid: string;
    textData?: string | null;
    addingTextData?: string | null;
    dialectOrArea?: string | null;
    addInfoType: string;
    termUuid: string;
    parentAddInfoUuid?: string | null;
    createdAt: string;
    updatedAt: string;
};

export const termAddingInfoSchema: RxJsonSchema<TermAddingInfoDocType> = {
    title: 'term adding info schema',
    version: 0,
    description: 'Additional info for terms',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        textData: { type: ['string', 'null'] },
        addingTextData: { type: ['string', 'null'] },
        dialectOrArea: { type: ['string', 'null'] },
        addInfoType: { type: 'string' },
        termUuid: { type: 'string', maxLength: 100 },
        parentAddInfoUuid: { type: ['string', 'null'], maxLength: 100 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    required: ['uuid', 'userUuid', 'addInfoType', 'termUuid', 'createdAt', 'updatedAt'],
    indexes: ['userUuid', 'termUuid'],
};