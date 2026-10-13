import { RxJsonSchema } from 'rxdb';
import { SyncRuleTargetType } from '@rem-web/domain';

export type SyncRuleDocType = {
    uuid: string;
    userUuid: string;
    targetUuid: string;
    targetType: SyncRuleTargetType;
    isIncluded: boolean;
    createdAt: string;
    updatedAt: string;
};

export const syncRuleSchema: RxJsonSchema<SyncRuleDocType> = {
    title: 'sync rule schema',
    version: 0,
    description: 'Rules for selective offline synchronization',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        targetUuid: { type: 'string', maxLength: 100 },
        targetType: { type: 'string', maxLength: 50 },
        isIncluded: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
    },
    required: [
        'uuid',
        'userUuid',
        'targetUuid',
        'targetType',
        'isIncluded',
        'createdAt',
        'updatedAt',
    ],
    indexes: ['userUuid', 'targetUuid', 'targetType'],
};