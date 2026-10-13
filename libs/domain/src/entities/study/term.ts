// domain/src/entities/term.ts

import { LearnWriteEntity } from './enums';
import {
     IPersonalSyncEntityProps,
    ISyncableEntityProps,
    PersSyncableEntity,
    SyncableEntity
} from '../sync/abs.entity';

export interface SharedTermProps extends ISyncableEntityProps {
    uuid: string;
    term: string;
    definition: string;
    moduleUuid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TermProps extends SharedTermProps, IPersonalSyncEntityProps {
    uuid: string;
    userUuid: string;
    term: string;
    definition: string;
    moduleUuid: string;
    chooseErrorCounter: number;
    writeErrorCounter: number;
    choiceNegErrorCounter: number;
    watchCount: number;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;
}

export class SharedTerm extends SyncableEntity implements SharedTermProps {
    term: string;
    definition: string;
    moduleUuid: string;
    createdAt: Date;

    constructor(props: SharedTermProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
        );
        this.term = props.term;
        this.definition = props.definition;
        this.moduleUuid = props.moduleUuid;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}

export class Term extends PersSyncableEntity implements LearnWriteEntity, TermProps {
    userUuid: string;
    term: string;
    definition: string;
    moduleUuid: string;

    private _chooseErrorCounter: number;
    private _writeErrorCounter: number;
    private _choiceNegErrorCounter: number;
    private _watchCount: number;

    createdAt: Date;
    personalCreatedAt: Date;

    constructor(props: TermProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
            props.personalUpdatedAt,
            props.personalSyncState ?? 'synced',
        );
        this.userUuid = props.userUuid;
        this.term = props.term;
        this.definition = props.definition;
        this.moduleUuid = props.moduleUuid;
        this._chooseErrorCounter = Math.max(0, props.chooseErrorCounter);
        this._writeErrorCounter = Math.max(0, props.writeErrorCounter);
        this._choiceNegErrorCounter = Math.max(0, props.choiceNegErrorCounter);
        this._watchCount = Math.max(0, props.watchCount);
        this.createdAt = props.createdAt;
        this.personalCreatedAt = props.personalCreatedAt;
    }

    get chooseErrorCounter(): number { return this._chooseErrorCounter; }
    set chooseErrorCounter(val: number) { this._chooseErrorCounter = Math.max(0, val); }

    get writeErrorCounter(): number { return this._writeErrorCounter; }
    set writeErrorCounter(val: number) { this._writeErrorCounter = Math.max(0, val); }

    get choiceNegErrorCounter(): number { return this._choiceNegErrorCounter; }
    set choiceNegErrorCounter(val: number) { this._choiceNegErrorCounter = Math.max(0, val); }

    get watchCount(): number { return this._watchCount; }
    set watchCount(val: number) { this._watchCount = Math.max(0, val); }
}