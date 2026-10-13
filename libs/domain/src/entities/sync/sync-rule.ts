export type SyncRuleTargetType = 'global' | 'folder' | 'module';

export interface SyncRuleProps {
    uuid: string;
    userUuid: string;
    targetUuid: string; // 'GLOBAL' или uuid конкретной папки/модуля
    targetType: SyncRuleTargetType;
    isIncluded: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class SyncRule implements SyncRuleProps {
    uuid: string;
    userUuid: string;
    targetUuid: string;
    targetType: SyncRuleTargetType;
    isIncluded: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(props: SyncRuleProps) {
        this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.targetUuid = props.targetUuid;
        this.targetType = props.targetType;
        this.isIncluded = props.isIncluded;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}