// domain/src/entities/term-adding-info.ts

import { AddInfoType, LearnWriteEntity } from './enums';
import { ISyncableEntityProps, SyncableEntity} from '../sync/abs.entity';

export interface TermAddingInfoProps extends ISyncableEntityProps {
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

export class TermAddingInfo extends SyncableEntity implements LearnWriteEntity, TermAddingInfoProps {
    userUuid: string;
    textData: string | null;
    addingTextData: string | null;
    dialectOrArea: string | null;
    addInfoType: AddInfoType;
    termUuid: string;
    parentAddInfoUuid: string;
    createdAt: Date;

    constructor(props: TermAddingInfoProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
        );
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
}