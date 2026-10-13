import { RxJsonSchema } from 'rxdb';
import { DeleteScope, EntityType } from '@rem-web/domain';

export type DeletedEntityDocType = {
    uuid: string;
    userUuid: string;
    entityUuid: string;
    entityType: EntityType;
    scope: DeleteScope;
    deletedAt: string;
};

export const deletedEntitySchema: RxJsonSchema<DeletedEntityDocType> = {
    title: 'deleted entity outbox schema',
    version: 0,
    description: 'Queue for entities physically deleted on local client',
    primaryKey: 'uuid',
    type: 'object',
    properties: {
        uuid: { type: 'string', maxLength: 100 },
        userUuid: { type: 'string', maxLength: 100 },
        entityUuid: { type: 'string', maxLength: 100 },
        entityType: { type: 'string', maxLength: 50 },
        scope: { type: 'string', maxLength: 50 },
        deletedAt: { type: 'string', format: 'date-time' },
    },
    required: [
        'uuid',
        'userUuid',
        'entityUuid',
        'entityType',
        'scope',
        'deletedAt',
    ],
    indexes: ['userUuid', 'entityUuid', 'entityType'],
};