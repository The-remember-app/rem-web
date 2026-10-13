// domain/src/entities/base/base-domain.entity.ts



import {SyncState} from "./enums";


export interface ISyncableEntityProps  {
    uuid: string;
    syncState?: SyncState;
    updatedAt: Date;
}

export interface ISyncableEntity extends ISyncableEntityProps {
    syncState: SyncState;
}

export interface IPersonalSyncEntityProps extends ISyncableEntityProps {
    personalUpdatedAt: Date;
    personalSyncState?: SyncState;
}

export interface IPersonalSyncEntity extends IPersonalSyncEntityProps, ISyncableEntity {
    syncState: SyncState;
    personalUpdatedAt: Date;
    personalSyncState: SyncState;
}

export abstract class BaseDomainEntity  {
    constructor(
        public readonly uuid: string,
        public updatedAt: Date
    ) {}
}

/**
 * Базовый класс для простых сущностей без разделения
 * (Sentence, TermAddingInfo, LearnTermDatetimeMark, User)
 */
export abstract class SyncableEntity extends BaseDomainEntity  implements ISyncableEntity{
    constructor(
        uuid: string,
        updatedAt: Date,
        public syncState: SyncState = 'synced'
    ) {
        super(uuid, updatedAt);
    }
}

/**
 * Базовый класс для сущностей с разделением Общей и Персональной части
 * (Folder, Module, Term)
 */
export abstract class PersSyncableEntity extends SyncableEntity implements ISyncableEntity, IPersonalSyncEntity {
    constructor(
        uuid: string,
        updatedAt: Date,
        syncState: SyncState = 'synced',
        public personalUpdatedAt: Date,
        public personalSyncState: SyncState = 'synced',

    ) {
        super(uuid, updatedAt, syncState);
    }
}