// domain/src/entities/module.ts

import { FolderOrModule } from './enums';
import {
     IPersonalSyncEntityProps,
    ISyncableEntityProps,
    PersSyncableEntity,
    SyncableEntity
} from '../sync/abs.entity';

export interface SharedModuleProps extends ISyncableEntityProps {
    uuid: string;
    name: string;
    description?: string | null;
    rootFolderUuid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ModuleProps extends SharedModuleProps, IPersonalSyncEntityProps {
    uuid: string;
    userUuid: string;
    name: string;
    description?: string | null;
    rootFolderUuid: string;
    isReverseDefinitionWrite: boolean;
    standardAndReverseWrite: boolean;
    isReverseDefinitionChoice: boolean;
    standardAndReverseChoice: boolean;
    maxIterationLen: number;
    minIterationLen: number;
    minWatchCount: number;
    knownTermPart: number;
    choicesCount: number;
    isLearnt: boolean;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;
}

export class SharedModule extends SyncableEntity implements SharedModuleProps {
    name: string;
    description?: string | null;
    rootFolderUuid: string;
    createdAt: Date;

    constructor(props: SharedModuleProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
        );
        this.name = props.name;
        this.description = props.description ?? null;
        this.rootFolderUuid = props.rootFolderUuid;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}

export class Module extends PersSyncableEntity implements FolderOrModule, ModuleProps {
    userUuid: string;
    name: string;
    description?: string | null;
    rootFolderUuid: string;
    isReverseDefinitionWrite: boolean;
    standardAndReverseWrite: boolean;
    isReverseDefinitionChoice: boolean;
    standardAndReverseChoice: boolean;
    maxIterationLen: number;
    minIterationLen: number;
    minWatchCount: number;
    knownTermPart: number;
    choicesCount: number;
    isLearnt: boolean;
    createdAt: Date;
    personalCreatedAt: Date;

    constructor(props: ModuleProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
            props.personalUpdatedAt,
            props.personalSyncState ?? 'synced',
        );
        this.userUuid = props.userUuid;
        this.name = props.name;
        this.description = props.description ?? null;
        this.rootFolderUuid = props.rootFolderUuid;
        this.isReverseDefinitionWrite = props.isReverseDefinitionWrite;
        this.standardAndReverseWrite = props.standardAndReverseWrite;
        this.isReverseDefinitionChoice = props.isReverseDefinitionChoice;
        this.standardAndReverseChoice = props.standardAndReverseChoice;
        this.maxIterationLen = props.maxIterationLen ?? 10;
        this.minIterationLen = props.minIterationLen ?? 4;
        this.minWatchCount = props.minWatchCount ?? 5;
        this.knownTermPart = props.knownTermPart ?? 30;
        this.choicesCount = props.choicesCount ?? 4;
        this.isLearnt = props.isLearnt ?? false;
        this.createdAt = props.createdAt;
        this.personalCreatedAt = props.personalCreatedAt;
    }
}