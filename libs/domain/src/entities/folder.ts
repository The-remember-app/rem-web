import { FolderOrModule } from './enums';

export interface FolderProps {
    uuid: string;
    userUuid: string;
    name: string;
    authorUuid: string;
    rootFolderUuid: string;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;
}

export class Folder implements FolderOrModule, FolderProps {
    uuid: string;
    userUuid: string;
    name: string;
    authorUuid: string;
    rootFolderUuid: string;
    createdAt: Date;
    updatedAt: Date;
    personalCreatedAt: Date;
    personalUpdatedAt: Date;

    constructor(props: FolderProps) {
        this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.name = props.name;
        this.authorUuid = props.authorUuid;
        this.rootFolderUuid = props.rootFolderUuid;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.personalCreatedAt = props.personalCreatedAt;
        this.personalUpdatedAt = props.personalUpdatedAt;
    }
}