import { WatchLearnType } from './enums';

export interface LearnTermDatetimeMarkProps {
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

export class LearnTermDatetimeMark implements LearnTermDatetimeMarkProps {
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

    constructor(props: LearnTermDatetimeMarkProps) {
        this.uuid = props.uuid;
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