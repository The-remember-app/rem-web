export interface SentenceProps {
    uuid: string;
    userUuid: string;
    sentence?: string | null;
    translate?: string | null;
    termUuid: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Sentence implements SentenceProps {
    uuid: string;
    userUuid: string;
    sentence: string | null;
    translate: string | null;
    termUuid: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(props: SentenceProps) {
        this.uuid = props.uuid;
        this.userUuid = props.userUuid;
        this.sentence = props.sentence ?? null;
        this.translate = props.translate ?? null;
        this.termUuid = props.termUuid;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}