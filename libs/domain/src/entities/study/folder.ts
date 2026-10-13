import { FolderOrModule } from './enums';
import {
     IPersonalSyncEntityProps,
    ISyncableEntityProps,
    PersSyncableEntity,
    SyncableEntity
} from "../sync/abs.entity";


// domain/src/entities/shared-folder.ts
export interface SharedFolderProps extends ISyncableEntityProps{
    uuid: string;
    name: string;
    authorUuid: string;
    rootFolderUuid: string | null;
    createdAt: Date;
    updatedAt: Date;
}



export interface FolderProps extends SharedFolderProps, IPersonalSyncEntityProps {
    uuid: string;
    userUuid: string;
    name: string;
    authorUuid: string;
    rootFolderUuid: string | null;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;
}


export class SharedFolder extends SyncableEntity implements SharedFolderProps {
    name: string;
    authorUuid: string;
    rootFolderUuid: string | null;
    createdAt: Date;

    constructor(props: SharedFolderProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
        );
        this.name = props.name;
        this.authorUuid = props.authorUuid;
        this.rootFolderUuid = props.rootFolderUuid;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}

export class Folder extends PersSyncableEntity  implements FolderOrModule, FolderProps {
    // uuid: string;
    userUuid: string;
    name: string;
    authorUuid: string;
    rootFolderUuid: string | null;
    createdAt: Date;
    // updatedAt: Date;
    personalCreatedAt: Date;
    // personalUpdatedAt: Date;

    constructor(props: FolderProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
            props.personalUpdatedAt,
            props.personalSyncState ?? 'synced',
        );
        // this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.name = props.name;
        this.authorUuid = props.authorUuid;
        this.rootFolderUuid = props.rootFolderUuid;
        this.createdAt = props.createdAt;
        // this.updatedAt = props.updatedAt;
        this.personalCreatedAt = props.personalCreatedAt;
        // this.personalUpdatedAt = props.personalUpdatedAt;
    }
}