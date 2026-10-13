// domain/src/entities/sentence.ts

import {ISyncableEntityProps, SyncableEntity} from '../sync/abs.entity';

export interface SentenceProps extends ISyncableEntityProps {
    uuid: string;
    userUuid: string;
    sentence?: string | null;
    translate?: string | null;
    termUuid: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Sentence extends SyncableEntity implements SentenceProps {
    userUuid: string;
    sentence: string | null;
    translate: string | null;
    termUuid: string;
    createdAt: Date;

    constructor(props: SentenceProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
        );
        this.userUuid = props.userUuid;
        this.sentence = props.sentence ?? null;
        this.translate = props.translate ?? null;
        this.termUuid = props.termUuid;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}