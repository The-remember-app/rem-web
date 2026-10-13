// domain/src/entities/learn-term-datetime-mark.ts

import { WatchLearnType } from './enums';
import { ISyncableEntityProps, SyncableEntity} from '../sync/abs.entity';

export interface LearnTermDatetimeMarkProps extends ISyncableEntityProps {
    uuid: string;
    userUuid: string;
    termUuid: string;
    startWatch: Date;
    endWatch: Date;
    isLearnt: boolean;
    isLearnIterStart: boolean;
    watchType: WatchLearnType;
    createdAt: Date;
    updatedAt: Date;
}

export class LearnTermDatetimeMark extends SyncableEntity implements LearnTermDatetimeMarkProps {
    userUuid: string;
    termUuid: string;
    startWatch: Date;
    endWatch: Date;
    isLearnt: boolean;
    isLearnIterStart: boolean;
    watchType: WatchLearnType;
    createdAt: Date;

    constructor(props: LearnTermDatetimeMarkProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
        );
        this.userUuid = props.userUuid;
        this.termUuid = props.termUuid;
        this.startWatch = props.startWatch;
        this.endWatch = props.endWatch;
        this.isLearnt = props.isLearnt;
        this.isLearnIterStart = props.isLearnIterStart;
        this.watchType = props.watchType;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}