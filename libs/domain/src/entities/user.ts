export interface UserProps {
    uuid: string;
    username: string;
    password?: string;
    email: string;
    name: string;
    surname: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export class User implements UserProps {
    uuid: string;
    username: string;
    password?: string;
    email: string;
    name: string;
    surname: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;

    constructor(props: UserProps) {
        this.uuid = props.uuid;
        this.username = props.username;
        this.password = props.password;
        this.email = props.email;
        this.name = props.name;
        this.surname = props.surname;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.active = props.active;
    }
}