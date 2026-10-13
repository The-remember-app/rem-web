export type EntityType =
    | 'folder'
    | 'module'
    | 'term'
    | 'sentence'
    | 'term_adding_info'
    | 'learn_mark'
    | 'user';

export type DeleteScope = 'full' | 'shared' | 'personal';

export interface DeletedEntityProps {
    uuid: string;
    userUuid: string;
    entityUuid: string;
    entityType: EntityType;
    scope: DeleteScope;
    deletedAt: Date;
}

export class DeletedEntity implements DeletedEntityProps {
    uuid: string;
    userUuid: string;
    entityUuid: string;
    entityType: EntityType;
    scope: DeleteScope;
    deletedAt: Date;

    constructor(props: DeletedEntityProps) {
        this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.entityUuid = props.entityUuid;
        this.entityType = props.entityType;
        this.scope = props.scope;
        this.deletedAt = props.deletedAt;
    }
}