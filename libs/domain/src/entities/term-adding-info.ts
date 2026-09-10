import { AddInfoType, LearnWriteEntity } from './enums';

export interface TermAddingInfoProps {
    uuid: string;
    userUuid: string;
    textData?: string | null;
    addingTextData?: string | null;
    dialectOrArea?: string | null;
    addInfoType: AddInfoType;
    termUuid: string;
    parentAddInfoUuid?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class TermAddingInfo implements LearnWriteEntity, TermAddingInfoProps {
    uuid: string;
    userUuid: string;
    textData: string | null;
    addingTextData: string | null;
    dialectOrArea: string | null;
    addInfoType: AddInfoType;
    termUuid: string;
    parentAddInfoUuid: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(props: TermAddingInfoProps) {
        this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.textData = props.textData ?? null;
        this.addingTextData = props.addingTextData ?? null;
        this.dialectOrArea = props.dialectOrArea ?? null;
        this.addInfoType = props.addInfoType;
        this.termUuid = props.termUuid;
        this.parentAddInfoUuid = props.parentAddInfoUuid ?? '';
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    // get targetWrite(): string {
    //     return this.textData ?? '';
    // }
}