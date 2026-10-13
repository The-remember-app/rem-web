// domain/src/entities/user.ts

import {ISyncableEntityProps, SyncableEntity} from '../sync/abs.entity';

export interface UserProps extends ISyncableEntityProps {
    uuid: string;
    username: string;
    password?: string | null;
    email: string;
    name: string;
    surname: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export class User extends SyncableEntity implements UserProps {
    username: string;
    password?: string | null;
    email: string;
    name: string;
    surname: string;
    createdAt: Date;
    active: boolean;

    constructor(props: UserProps) {
        super(
            props.uuid,
            props.updatedAt,
            props.syncState ?? 'synced',
        );
        this.username = props.username;
        this.password = props.password ?? null;
        this.email = props.email;
        this.name = props.name;
        this.surname = props.surname;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.active = props.active;
    }
}